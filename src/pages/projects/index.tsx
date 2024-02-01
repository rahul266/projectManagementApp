'use client'
import { Project } from "@prisma/client"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState,useEffect } from "react"
import { api } from "~/utils/api"
import { createProject } from "~/server/api/routers/projects"

const ProjectPage = () => {
    const sessionData = useSession();
    const userId=sessionData.data?.user.id
    const [list, setList] = useState<createProject[]>([])
    const mutation = api.post.createProject.useMutation()
    const { data: mutationResponse } = mutation
    if (!userId) {
        return (<>off the project</>)
    }
    const { data: response, isLoading } = api.post.getProjects.useQuery({ userId: userId });
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (response) {
                    setList(response as createProject[]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [response]);
    useEffect(() => {
        if (mutationResponse) {
            setList(prevList => [...prevList, mutationResponse]);
        }
    }, [mutationResponse])
    const creatProject = async () => {
        const inputElement: HTMLInputElement = document.getElementById("projectName") as HTMLInputElement
        const projectName: string = inputElement?.value as string
        inputElement.value = ""
        const createdBy = sessionData?.data?.user.id;
        if (!createdBy) {
            console.error("User ID is undefined");
            return;
        }

        const CreateTableData = {
            projectName: projectName,
            user: createdBy,
        };
        const data = mutation.mutate(CreateTableData )
    }
    if (isLoading) {
        return (<div className="flex-row min-h-screen">
            <>Relax till we get Your projects...</>
            </div>)
    }
    return (
        <div className="flex-row min-h-screen">
            <div className="flex justify-end">
                <fieldset className="px-10 py-2">
                    <input className="px-6 h-8 rounded-sm caret-blue-500 border-b-2 focus:border-orange-400 focus:outline-none" placeholder="Project Name" type="text" name="" id="projectName" />
                </fieldset>
                <button id='createProject' className="bg-orange-400 px-10 py-3  rounded-3xl right-0"
                    onClick={creatProject}>
                    Create a project
                </button>
            </div>
            {list && list.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <strong>Project Names:</strong>
                        {list.map((project) => (
                            <Link href={`project/${project.id}`} id={project.id}  legacyBehavior>
                            <div key={project.id} className="p-2 border-b cursor-pointer border-gray-300 hover:text-blue-500">
                                
                                    <a href="">{project.ProjectName}</a>
                                
                            </div>
                            </Link>
                        ))}
                    </div>
                    <div className="col-span-1">
                        <strong>Created By:</strong>
                        {list.map((project) => (
                            <div key={project.id} className="p-2 border-b border-gray-300">
                                {project.name}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>No Projects</p>
            )}
        </div>
    )
}

export default ProjectPage