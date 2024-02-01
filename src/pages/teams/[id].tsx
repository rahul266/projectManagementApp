import { Project, User } from "@prisma/client"
import { GetServerSideProps } from "next"
import { getProjectsOfUser, getProjectsOfUserSchemaInput, getUsersofAProject } from "~/server/api/routers/projects"
import { db } from "~/server/db"
import { createProject } from "../ticket/create/[userId]"
import { api } from "~/utils/api"
import { useEffect, useState } from "react"

interface getProps{
    data:propsDetails[]
}
interface propsDetails{
    projectId: string
    projectName: string
    users:User[]
}

const TeamsPage = (props:getProps) => {
    const [details,setDetails] = useState(props.data)
    const [successMessage, setSuccessMessage] = useState('');
    const [projectIdOfNewUser, setProjectIdOfNewUser] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const addUserMutation = api.post.addUsersToProject.useMutation({
        onSuccess: (data) => {
            setSuccessMessage(`user ${data.name} added`);
            addUserToDetails(projectIdOfNewUser,data)
        },
        onError: (data) => {
            setErrorMessage('Failed: ' + data.message);
        }
    })
    useEffect(() => {
        if (successMessage || errorMessage) {
            setShowPopup(true);
        }

        const timeoutId = setTimeout(() => {
            setShowPopup(false);
            setSuccessMessage('');
            setErrorMessage('');
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [successMessage, errorMessage]);

    const addUserToDetails=(projectId: string, newUserData: User)=>{
        setDetails((prevDetails) =>
            prevDetails.map((project) =>
                project.projectId === projectId
                    ? { ...project, users: [...project.users, newUserData] }
                    : project
            )
        );
    }

    const addUserhandler = (projectId:string) => {
        const addUserField: HTMLInputElement = document.getElementById(projectId + "-input") as HTMLInputElement
        const userEmail = addUserField?.value
        if (!userEmail) {
            addUserField?.focus()
        }
        const project = details.find((project) => project.projectId === projectId);
        if (project) {
            const user = project.users.find((user) => user.email === userEmail);
            if (!user) {
                setProjectIdOfNewUser(projectId)
                addUserMutation.mutate({ projectId: projectId, email: userEmail })
                setSuccessMessage("please wait till we add user...");
            } else {
                setErrorMessage('User is already in the project team ');
            }
            addUserField.value = ''
        } else {
            return
        }
    }
    return (
        <div className="grid gap-4 min-h-screen">
            <div>
                {showPopup && (
                    <div className="fixed top-10 right-10 z-50">
                        <div className="bg-white shadow-md rounded-lg p-4">
                            <div className={`text-green-500 bg-green-100 rounded-md px-4 py-2 font-medium ${successMessage ? '' : 'hidden'}`}>
                                {successMessage}
                            </div>
                            <div className={`text-red-500 bg-red-100 rounded-md px-4 py-2 font-medium ${errorMessage ? '' : 'hidden'}`}>
                                {errorMessage}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {details.map((project) => (
                <div key={project.projectId} className="border p-4 bg-white overflow-y-auto h-96">
                    <div className="border-b-2 flex justify-between items-center">
                        <h3 className="font-bold py-2 text-xl mb-2">{project.projectName}: </h3>
                        <div className="flex items-center">
                            <input key={project.projectId} className="px-6 h-8 mx-3 rounded-sm caret-blue-500 border-b-2 focus:border-orange-400 focus:outline-none" placeholder="User Email" type="text" name="" id={project.projectId + "-input"} />
                            <button className="bg-orange-400 px-10 py-2  rounded-3xl right-0"
                                onClick={() => { addUserhandler(project.projectId) }}
                            >
                                Add user
                            </button>
                        </div>
                    </div>
                    <ul>
                        {project.users.map((user) => (
                            <li key={user.id} className="flex py-2 items-center space-x-2">
                                <img
                                    src={user.image||'../../../public/Defaultuser.png'}
                                    alt={user.name || 'unavailable'}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span>{user.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}

export const getServerSideProps:GetServerSideProps = async (context) => {
    const id = context.query.id as string
    const input:getProjectsOfUserSchemaInput={userId:id}
    const res = await getProjectsOfUser(db, input)
    const data = res as createProject[]
    const projectIds = data.map(item => item.id);
    const promises = projectIds.map(async (projectId:string) => {
        try {
            const result = await getUsersofAProject(db, { projectId: projectId });
            return result; 
        } catch (error) {
            console.error(`Error processing projectId ${projectId}:`, error);
            return null; 
        }
    });
    const results = await Promise.all(promises);
    const responseData = data.map((project:Project, index) => {
        const users = results[index] || []; 
        return {
            projectId: project.id,
            projectName: project.ProjectName, 
            users,
        };
    });
    return { props: { data: responseData } };
}

export default TeamsPage