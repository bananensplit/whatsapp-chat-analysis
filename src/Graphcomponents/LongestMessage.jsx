import { Box, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
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
        () =>
            new Worker(new URL("../calcWorkers/LongestMessage.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [longestMessagesBySender, setLongestMessagesBySender] = useState([]);

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            worker.postMessage({ chatDataWithoutMedia });
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
            <Typography textAlign="center" variant="h3" gutterBottom>
                Longest messages
            </Typography>

            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                Another thing you can do is find the longest messages sent by each person. This
                rather simple in comparison to the other analysis. Below you can see the longest
                messages sent by each person in the chat.
            </Typography>
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                The length of each message is determined by the character count (not the word
                count). When there are multiple messages with the same length, the first message is
                shown. Be aware that some emojis are multiple characters long and will therefore be
                counted as such. For Example flags are 4 characters long (
                <Typography variant="code">'🇵🇱'.length == 4</Typography>)
            </Typography>

            {longestMessagesBySender.map((message) => (
                <Box mt="20px">
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
                            overflowWrap: "break-word",
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
    );
}

export default LongestMessage;
