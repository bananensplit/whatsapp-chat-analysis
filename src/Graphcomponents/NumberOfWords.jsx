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
function NumberOfWords({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("../calcWorkers/NumberOfWords.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [totalWords, setTotalWords] = useState("-");
    const [totalWordsBySender, setTotalWordsBySender] = useState({});
    const [distinctWords, setDistinctWords] = useState("-");
    const [distinctWordsBySender, setDistinctWordsBySender] = useState({});

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            worker.postMessage({ chatDataWithoutMedia });
        }
    }, [chatDataWithoutMedia]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setTotalWords(result.totalWords);
            setTotalWordsBySender(result.totalWordsBySender);
            setDistinctWords(result.distinctWords);
            setDistinctWordsBySender(result.distinctWordsBySender);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography textAlign="center" variant="h3" gutterBottom>
                Number of words
            </Typography>

            <Grid container>
                <Grid xs={6} item p="0 20px">
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        In total there are <b style={{ fontSize: "large" }}>{totalWords} words</b>{" "}
                        in the chat.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        The graph on below shows the distribution of the messages among the
                        different senders. When you hover over a given section it will show you the
                        exact number of messages and the name of the according sender.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        Media messages are not included in this graph (because how???).
                    </Typography>
                </Grid>

                <Grid xs={6} item p="0 20px">
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        In total are{" "}
                        <b style={{ fontSize: "large" }}>{distinctWords} distinct words</b> used in
                        the chat.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        The graph below shows the number of unique words used by each sender.
                    </Typography>
                    <Typography textAlign="justify" variant="body1" gutterBottom>
                        Please note that the numbers will not add up to the total
                        number of different words. This is because the same word can be used by
                        multiple senders and therefore be counted multiple times.
                    </Typography>
                </Grid>

                <Grid xs={6} item height="300px">
                    <ResponsiveSunburst
                        data={totalWordsBySender}
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

                <Grid xs={6} item height="300px">
                    <ResponsiveSunburst
                        data={distinctWordsBySender}
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

export default NumberOfWords;
