import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { ResponsiveSunburst } from "@nivo/sunburst";
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
function Introduction({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () => new WorkerBuilder("../calcWorkers/Introduction.worker.jsx", import.meta.url),
        []
    );

    const [messageCounts, setMessageCounts] = useState({});
    const [wordCounts, setWordCounts] = useState({});
    const [charCounts, setCharCounts] = useState({});

    useEffect(() => {
        if (chatData !== "" && chatDataWithoutMedia !== "") {
            setLoading(true);
            worker.postMessage({ chatData: chatData, chatDataWithoutMedia: chatDataWithoutMedia });
        }
    }, [chatData, chatDataWithoutMedia]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setMessageCounts(result.messageCounts);
            setWordCounts(result.wordCounts);
            setCharCounts(result.charCounts);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography align="center" variant="h3" gutterBottom>
                Introduction
            </Typography>

            <Grid
                container
                spacing={2}
                sx={{
                    width: "100%",
                    mt: "20px",
                }}
            >
                <Typography align="center" variant="h4" component={Grid} xs={4}>
                    Number of messages
                </Typography>
                <Typography align="center" variant="h4" component={Grid} xs={4}>
                    Number of words
                </Typography>
                <Typography align="center" variant="h4" component={Grid} xs={4}>
                    Number of characters
                </Typography>

                <Typography sx={{ textAlign: "justify" }} variant="body1" component={Grid} xs={4}>
                    The first graph shows the total number of messages sent by each person. It also
                    shows the number of text messages and media messages sent by each person. Media
                    messages are messages that only contain media (e.g. images, videos, gifs,
                    audios, voice recordings, etc.).
                </Typography>
                <Typography sx={{ textAlign: "justify" }} variant="body1" component={Grid} xs={4}>
                    The second graph shows the number of words sent by each person. A word is
                    defined as a sequence of characters separated by a space. If a message contains
                    only media, it is not included in this graph.
                </Typography>
                <Typography sx={{ textAlign: "justify" }} variant="body1" component={Grid} xs={4}>
                    The third graph shows the number of characters sent by each person. If a message
                    contains only media, it is not included in this graph.
                </Typography>

                {[messageCounts, wordCounts, charCounts].map((data) => (
                    <Grid xs={4} sx={{ height: "300px" }}>
                        <ResponsiveSunburst
                            data={data}
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
                ))}
            </Grid>
        </Box>
    );
}

export default Introduction;
