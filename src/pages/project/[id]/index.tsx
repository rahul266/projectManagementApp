import { Project, Ticket } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { getprojectDetails } from "~/server/api/routers/projects"
import { getProjectTicketsIdSchemainput, getTicketsOfAProject } from "~/server/api/routers/tickets"
import { db } from "~/server/db"
import DatePicker from "react-datepicker"
import { TicketStatuses, TicketTypes } from "~/utils/constant"
import { api } from "~/utils/api"

interface propsResponseSchema{
    ticketDetails: Ticket[]
    projectDetails: projectDetails
}

interface projectDetails{
    id: string,
    ProjectName: string,
    createdBy: string,
    deadLine: string
}

interface getProps {
    data: propsResponseSchema
}

const projectTicketListingPage = (props: getProps) => {
    const router = useRouter();
    const { id } = router.query
    const [status, setStatus] = useState<Number>(0)
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const updateDeadlineMutation = api.post.updateDeadLine.useMutation({
        onSuccess: () => {
            setSuccessMessage('DeadLine is updated');
        },
        onError: (data) => {
            setErrorMessage('Failed to update deadline details: ' + data.message);
        }
    })
    if (props.data.ticketDetails.length === 0) {
        return (<>No data to publish</>)
    }
    const list = props.data.ticketDetails
    const projectDetails = props.data.projectDetails
    const formatedDate = projectDetails.deadLine.slice(0, 10)
    
    const changingProjectDedline = (event: Date) => {
        updateDeadlineMutation.mutate({
            id: projectDetails.id,
            deadLine:event
        })
    }

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

    function addUserToProject(arg0: number): void {
        throw new Error("Function not implemented.")
    }

    return (
        <div className="h-screen ">
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
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-semibold">{projectDetails.ProjectName}</h1>
                <div className="flex items-center">
                    <label htmlFor="deadline" className="mr-2 text-sm font-medium">Deadline:</label>
                    <DatePicker selected={new Date(formatedDate)}
                        onChange={changingProjectDedline} />
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-semibold">Tickets:</h1>
            </div>
            <div>
                {list.map((ticket) => (
                    <div key={String(ticket.id)} className="flex items-center justify-between bg-white p-4 border mb-4 rounded-md hover:border-blue-500 hover:shadow-md cursor-pointer">
                        <div className="text-lg font-semibold">
                            {TicketTypes[ticket.ticketType]}:
                        </div>
                        <div className="text-sm flex-grow mx-4" onClick={() => router.push(`/project/${ticket.projectId}/ticket/${ticket.id}`)}>
                            <a>{truncateTicketName(ticket)}</a>
                        </div>
                        <div className="text-sm">
                            Status:
                            <select
                                value={String(ticket.ticketStatus)}
                                disabled
                                className="ml-2 p-1 border rounded-md focus:outline-none"
                            >
                                <option value="0">Select Status</option>
                                {Object.entries(TicketStatuses).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const truncateTicketName = (ticket: Ticket) => {
    const maxLength = 50
    return ticket.name.length > maxLength ? `${ticket.name.slice(0, maxLength)}...` : ticket.name;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const projectId = context.query.id as string;
    const input: getProjectTicketsIdSchemainput = {
        id: projectId,
    };
    const ticketDetails = await getTicketsOfAProject(db, input);
    const projectData = await getprojectDetails(db, input)
    if (!projectData) {
        return { props: { data: { ticketDetails:[], projectDetails:{} } } }
    }
    const projectDetails = { ...projectData, deadLine: projectData?.deadLine.toISOString() }
    const response = { ticketDetails, projectDetails }
    return { props: { data: response } };
}

export default projectTicketListingPage