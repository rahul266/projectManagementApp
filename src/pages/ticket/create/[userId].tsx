import { GetServerSideProps } from "next"
import { api } from "~/utils/api"
import { db } from "~/server/db"
import { getProjectsOfUser, getProjectsOfUserSchemaInput } from "~/server/api/routers/projects"
import { useEffect, useState } from "react"
import { ProjectUserMapping, User } from "@prisma/client"
import { TicketStatuses } from "~/utils/constant"
import { useRouter } from "next/router"
interface getProps {
    data: createProject[]
}
export interface createProject {
    id: string;
    ProjectName: string;
    CreatedBy: string;
    name: string;
    deadLine: Date;
    userId: string;
}
const ticketCreationPage = (props:getProps) => {
    const data = props.data
    const router = useRouter();
    if (data.length==0) {
        return(<>No projects</>)
    }
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const mutation = api.post.getUsersOfProject.useMutation()
    const createTicketMutation = api.ticket.createTicket.useMutation({
        onSuccess: (data) => {
            setSuccessMessage('Ticket details updated successfully!');
            router.push(`/project/${data.projectId}`)
        },
        onError: (data) => {
            setErrorMessage('Failed to update ticket details: ' + data.message);
        }
    })
    const { data: mutationResponse } = mutation
    const [projectId, setprojectId] = useState('');
    const [ticketStatus,setTicketStatus]=useState(1)
    const [ticketType, setTicketType] = useState(0);
    const [assignTo, setAssignTo] = useState('select'); 
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(1); 
    const [userData,setUsersData] =useState<User[]>([])
    const handleCreateTicket = () => {
        if (!projectId || projectId === '') {
            setErrorMessage('Please select a valid project.');
            return;
        }

        if (!ticketType || ticketType === 0) {
            setErrorMessage('Please select a valid ticket type.');
            return;
        }

        if (!assignTo || assignTo === 'select') {
            setErrorMessage('Please select a valid assignee.');
            return;
        }

        if (!ticketStatus || ticketStatus === 0) {
            setErrorMessage('Please select a valid ticket status.');
            return;
        }

        if (!name.trim()) {
            setErrorMessage('Please enter a valid summary.');
            return;
        }

        if (!description.trim()) {
            setErrorMessage('Please enter a valid description.');
            return;
        }

        if (!priority || priority === 0) {
            setErrorMessage('Please select a valid priority.');
            return;
        }
        const formData = {
            projectId: projectId,
            ticketStatus: ticketStatus,
            ticketType: ticketType,
            assignTo: assignTo,
            name: name,
            description: description,
            priority: priority
        }
        createTicketMutation.mutate(formData)
    }
    useEffect(() => {
        if (mutationResponse) {
            setUsersData((prevList) => [...prevList, ...mutationResponse])
        }
    }, [mutationResponse])
    useEffect(() => {
    }, [createTicketMutation])
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

    const setprojectIdAndPopulate = (event:HTMLSelectElement) => {
        setprojectId(event.value)
        mutation.mutate({ projectId: event.value })
        }
    return (
        <div className="grid grid-cols-1 gap-4 max-w-[500px] mx-auto">
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
            <div className="mb-4">
                <label htmlFor="projectId" className="mb-2 block font-semibold">
                    Project Name:
                </label>
                <select
                    className="w-full p-2 rounded-sm  border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    name="projectId"
                    id="projectId"
                    onChange={(event) => { setprojectIdAndPopulate(event.target) }}
                >
                    <option value="select">Select</option>
                    {data.map((element) => (
                        <option key={element.id} value={element.id}>
                            {element.ProjectName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="ticketType" className="mb-2 block font-semibold">
                    Ticket Type:
                </label>
                <select
                    className="w-full p-2 rounded-sm  border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    name="ticketType"
                    id="ticketType"
                    onChange={(event) => { setTicketType(parseInt(event.target.value)) }}
                >
                    <option value="0">Select</option>
                    <option value="1">Task</option>
                    <option value="2">Bug</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="assignTo" className="mb-2 block font-semibold">
                    Assign to:
                </label>
                <select
                    className="w-full p-2 rounded-sm  border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    name="assignTo"
                    id="assignTo"
                    onChange={(event) => { setAssignTo(event.target.value) }}
                >
                    <option value="select">Select</option>
                    {userData.map((element) => (
                        <option key={element.id} value={element.id}>
                            {element.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="ticketStatus" className="mb-2 block font-semibold">
                    Ticket Status:
                </label>
                <select
                    className="w-full p-2 rounded-sm border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    name="ticketStatus"
                    id="ticketStatus"
                    value={ticketStatus}
                    onChange={(event) => { setTicketStatus(parseInt(event.target.value)) }}
                >
                    <option value="0">Select</option>
                    {Object.entries(TicketStatuses).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="name" className="mb-2 block font-semibold">
                    Summary:
                </label>
                <input
                    className="w-full p-2 rounded-sm  border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    type="text"
                    id="name"
                    name="name"
                    onChange={(event) => { setName(event.target.value) }}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="description" className="mb-2 block font-semibold">
                    Description:
                </label>
                <textarea
                    className="w-full p-2  rounded-sm border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    name="description"
                    id="description"
                    cols={30}
                    rows={5}
                    onChange={(event) => { setDescription(event.target.value) }}
                ></textarea>
            </div>
            <div className="mb-4">
                <label htmlFor="priority" className="mb-2 block font-semibold">
                    Priority:
                </label>
                <select
                    className="w-full p-2 rounded-sm border-b-2 hover:border-neutral-900 focus:border-neutral-900  focus:outline-none"
                    name="priority"
                    id="priority"
                    value={priority}
                    onChange={(event) => { setPriority(parseInt(event.target.value)) }}
                >
                    <option value="0">Select</option>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                </select>
            </div>
            <div>
                <button
                    className="w-full text-white text-xl hover:bg-orange-500 bg-orange-400 px-10 py-3  rounded-3xl"
                    onClick={handleCreateTicket}
                >
                    Create Ticket
                </button>
            </div>
        </div>
    );
}


export const getServerSideProps: GetServerSideProps = async (context) => {
    const userId = context.query.userId as string;
    const schemaInput: getProjectsOfUserSchemaInput = {
        userId: userId,
    };
    const response = await getProjectsOfUser(db, schemaInput)
    const projects: createProject[] = response as createProject[];
    return {
        props: {
            data: projects.map((item) => ({
                ...item,
                deadLine: item.deadLine.toISOString(), // Convert to string
            }))
        }
    }
 }


export default ticketCreationPage