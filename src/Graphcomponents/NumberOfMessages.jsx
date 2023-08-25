import { Box, Grid, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import useFeedbackMachine from "../FeedbackMachine/useFeedbackMachine";
import { ResponsiveSunburst } from "@nivo/sunburst";

/**
 *
 * @param {Object} props
 * @param {import("data-forge").DataFrame} props.chatData
 * @param {import("data-forge").DataFrame} props.chatDataWithoutMedia
 * @returns {JSX.Element}
 */
function NumberOfMessages({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("../calcWorkers/NumberOfMessages.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [totalMessages, setTotalMessages] = useState("-");
    const [totalMessagesBySender, setTotalMessagesBySender] = useState({});

    useEffect(() => {
        if (chatData !== "") {
            setLoading(true);
            worker.postMessage({ chatData });
        }
    }, [chatData]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setTotalMessages(result.totalMessages);
            setTotalMessagesBySender(result.totalMessagesBySender);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography align="center" variant="h3" gutterBottom>
                Number of messages
            </Typography>

            <Grid container>
                <Grid xs={6} item p="0 20px">
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        In total there are <b style={{ fontSize: "large" }}>{totalMessages}</b>{" "}
                        messages in the chat.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        The graph shows the distribution of the messages among the different
                        senders. When you hover over a given section it will show you the exact
                        number of messages and the name of the according sender.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        This analysis divides messages into two categories:
                    </Typography>
                    <Typography textAlign="justify" ml="10px" variant="body1" gutterBottom>
                        <b>Media messages</b> are messages that only contain media. This includes
                        for example images, videos, gifs, audios, voice recordings and others.
                    </Typography>
                    <Typography textAlign="justify" ml="10px" variant="body1" gutterBottom>
                        <b>Text messages</b> on the other hand are messages that only consist of
                        text. They can contain emojis and links, but no images.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        If a image is sent with a caption, it will be counted as a text message.
                    </Typography>
                </Grid>
                <Grid xs={6} item maxHeight={"350px"}>
                    <ResponsiveSunburst
                        data={totalMessagesBySender}
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        id="name"
                        value="count"
                        valueFormat=" >-"
                        cornerRadius={10}
                        borderWidth={3}
                        colors={{ scheme: "nivo" }}
                        childColor={{
                            from: "color",
                            modifiers: [["brighter", 0.1]],
                        }}
                        enableArcLabels={true}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor={{
                            from: "color",
                            modifiers: [["darker", 1.4]],
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default NumberOfMessages;
