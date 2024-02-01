import { PrismaClient, Prisma, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { getUsersofAProject } from "~/server/api/routers/projects";
import { getTicketDetails, getTicketDetailsSchemaInput } from "~/server/api/routers/tickets";
import { db } from "~/server/db";
import { TicketStatuses, TicketTypes } from "~/utils/constant";
import { api } from "~/utils/api";

interface ticketDetails{
    id: number
    ticketStatus: number
    ticketType: number
    projectId: string
    name: string
    description: string
    assignedTo: string
    priority: number
    labels: string[]
    userDetails: User
}
interface ticketDetailsResponse{
    data:ticketDetails
}
interface propData{
    ticketDetails: ticketDetailsResponse
    membersOfUsers:User[]
}
interface getProps{
    data:propData
}


const projectTicketListingPage = (props: getProps) => { 
    const ticket = props.data.ticketDetails.data
    const membersOfUsers = props.data.membersOfUsers
    if (!ticket) {
      return (<></>)  
    }
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const updateTicketDetailsMutation = api.ticket.updateTicketDetails.useMutation({
        onSuccess: () => {
            setSuccessMessage('Ticket details updated successfully!');
        },
        onError: (data) => {
            setErrorMessage('Failed to update ticket details: ' + data.message);
        }
    })
    const [editableName, setEditableName] = useState(ticket.name);
    const [editableDescription, setEditableDescription] = useState(ticket.description);
    const [editableAssignTo, setEditableAssignTo] = useState(ticket.assignedTo);
    const [editableStatus, setEditableStatus] = useState(ticket.ticketStatus);

    const handleSaveChanges = async () => {
        const editedData = {
            id:ticket.id,
            name: editableName,
            assignTo: editableAssignTo,
            ticketStatus: editableStatus,
            description: editableDescription
        }
        updateTicketDetailsMutation.mutate(editedData)
    };

    

    // UseEffect to handle popup visibility and auto-closing
    useEffect(() => {
        if (successMessage || errorMessage) {
            setShowPopup(true);
        }

        const timeoutId = setTimeout(() => {
            setShowPopup(false);
            setSuccessMessage('');
            setErrorMessage('');
        }, 5000); // Close the popup after 5 seconds

        return () => clearTimeout(timeoutId);
    }, [successMessage, errorMessage]);

    return (
        <div className="h-screen">
            <div>
                {showPopup && (
                    <div className="fixed top-10 right-10 z-50"> {/* Position and layering */}
                        <div className="bg-white shadow-md rounded-lg p-4"> {/* Base styles for popup */}
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
        <div className="mx-auto max-w-100 shadow-md rounded-md p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">{TicketTypes[ticket.ticketType]}:</h2>
            <div className="mb-2">
                {/* <label className="block text-sm font-semibold mb-1">Name:</label> */}
                <input
                    className="w-full font-bold text-3xl font p-2 border bg-stone-100 focus:bg-white rounded-sm"
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">Description:</label>
                <textarea
                    className="w-full p-2 border rounded-sm bg-stone-100 focus:bg-white"
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                ></textarea>
            </div>
            <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">Assign To:</label>
                    <select
                        className="w-full p-2 border rounded-sm"
                        value={editableAssignTo}
                        onChange={(e) => setEditableAssignTo(e.target.value)}
                    >
                        {membersOfUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
            </div>
            <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">Status:</label>
                <select
                    className="w-full p-2 border rounded-sm"
                    value={editableStatus}
                    onChange={(e) => setEditableStatus(parseInt(e.target.value))}
                >
                    {Object.entries(TicketStatuses).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={handleSaveChanges}
                >
                    Save Changes
                </button>
            </div>
        </div>
        </div>
    );
}

export default projectTicketListingPage

export const getServerSideProps: GetServerSideProps = async (context) => {
    const projectId = context.query.id as string; 
    const ticketId = context.query.ticketId as string
    const input: getTicketDetailsSchemaInput = {
        id: parseInt(ticketId), 
        projectId:projectId
    };

    const ticketDetails = await getTicketDetails(db, input);
    const allUsersOfProject = await getUsersofAProject(db, { projectId: projectId })
    const response={ticketDetails,"membersOfUsers":allUsersOfProject}
    return { props: { data: response } };
}


