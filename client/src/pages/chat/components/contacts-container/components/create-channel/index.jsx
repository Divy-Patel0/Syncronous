
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";
import MultipleSelector from "@/components/ui/multipleselect";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES } from "@/utils/constants";
import { useSocket } from "@/context/SocketContext";
import { useAppStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CreateChannel = () => {
    const [newChannelModal, setNewChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const socket = useSocket();
    const { addChannel } = useAppStore();

    useEffect(() => {
        const getData = async () => {
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
                withCredentials: true,
            });
            setAllContacts(response.data.contacts);
        };
        getData();
    }, []);

    const createChannel = async () => {
        try {
            if (channelName.length > 0 && selectedContacts.length > 0) {
                const response = await apiClient.post(
                    CREATE_CHANNEL_ROUTE,
                    {
                        name: channelName,
                        members: selectedContacts.map((contact) => contact.value),
                    },
                    { withCredentials: true }
                );
                if (response.status === 201) {
                    setChannelName("");
                    setSelectedContacts([]);
                    setNewChannelModal(false);
                    addChannel(response.data.channel);
                    // socket.emit("add-channel-notify", response.data.channel);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className=" text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300"
                            onClick={() => setNewChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3">
                        Create New Channel
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
                <DialogDescription className="hidden">
                    Please insert details
                </DialogDescription>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-max flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please fill up the details for new channel.</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Channel Name"
                            className="rounded-lg py-6 px-4 bg-[#2c2e3b] border-none"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                        />
                    </div>
                    <div>
                        <MultipleSelector
                            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                            defaultOptions={allContacts}
                            placeholder="Search Contacts"
                            value={selectedContacts}
                            onChange={setSelectedContacts}
                            emptyIndicator={
                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                    No results found.
                                </p>
                            }
                        />
                    </div>
                    <div>
                        <Button
                            onClick={createChannel}
                            className=" w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                        >
                            Create Channel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CreateChannel;
