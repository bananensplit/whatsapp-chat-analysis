import { Box, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import WorkerBuilder from "../calcWorkers/WorkerBuilder.jsx";
import useFeedbackMachine from "../FeedbackMachine/useFeedbackMachine";

/**
 *
 * @param {Object} props
 * @param {import("data-forge").DataFrame} props.chatData
 * @param {import("data-forge").DataFrame} props.chatDataWithoutMedia
 * @returns {JSX.Element}
 */
function LongestMessage({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () => new WorkerBuilder("../calcWorkers/LongestMessage.worker.jsx", import.meta.url),
        []
    );

    const [longestMessagesBySender, setLongestMessagesBySender] = useState([]);

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            worker.postMessage(chatDataWithoutMedia);
        }
    }, [chatDataWithoutMedia]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setLongestMessagesBySender(result.longestMessagesBySender);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography align="center" variant="h3" gutterBottom>
                Longest messages
            </Typography>
            <Typography
                sx={{ mr: "20px", ml: "20px", textAlign: "justify" }}
                variant="body1"
                gutterBottom
            >
                Below you can see the longest message sent by each person. The length of each
                message is determined by the character count (not the word count). When there are
                multiple messages with the same length, the first message is shown.
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {longestMessagesBySender.map((message) => (
                    <Box>
                        <Typography align="center" variant="body1" gutterBottom>
                            Longest message sent by <b>{message.sender}</b> has a length of{" "}
                            <b>{message.messageLength}</b> characters and was sent on{" "}
                            <b>{moment(message.datetime).format("DD.MM.YYYY")}</b> at{" "}
                            <b>{moment(message.datetime).format("HH:mm")}</b>.
                        </Typography>

                        <Box
                            sx={{
                                background: "#128C7E",
                                color: "#FFFFFF",
                                whiteSpace: "pre-wrap",
                                padding: "10px",
                                borderRadius: "5px",
                                mr: "70px",
                                ml: "70px",
                            }}
                        >
                            <Typography variant="body1">{message.message}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default LongestMessage;
