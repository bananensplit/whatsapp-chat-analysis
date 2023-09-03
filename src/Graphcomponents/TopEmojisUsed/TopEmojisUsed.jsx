import { Box, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import * as dataForge from "data-forge";
import { useEffect, useMemo, useState } from "react";
import useFeedbackMachine from "../../FeedbackMachine/useFeedbackMachine";

/**
 *
 * @param {Object} props
 * @param {import("data-forge").DataFrame} props.chatData
 * @param {import("data-forge").DataFrame} props.chatDataWithoutMedia
 * @returns {JSX.Element}
 */
function TopEmojisUsed({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("./TopEmojisUsed.worker.jsx", import.meta.url), { type: "module" }),
        []
    );

    const [emojiCounts, setEmojiCounts] = useState([]);
    const [senders, setSenders] = useState([]);

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            fetch(import.meta.env.BASE_URL + "new_emoji.csv")
                .then((r) => r.text())
                .then((text) => dataForge.fromCSV(text).toJSON())
                .then((emoji) => worker.postMessage({ chatDataWithoutMedia, emoji }));
        }
    }, [chatDataWithoutMedia]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setEmojiCounts(result.emojiCounts);
            setSenders(result.senders);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography align="center" variant="h3" gutterBottom>
                Top 50 emojis used
            </Typography>
            
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                Below you can see the top 50 emojis used in the chat. The total height of each bar
                represents the total number of occurences of the emoji in the chat. The bars are
                split into segments, each representing the number of times the word was used by each
                sender.
            </Typography>
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                You can hover over the bars to see the exact number of times the word was used by
                each sender.
            </Typography>
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                If a sender doesn't appear in the bar, it means they didn't use the emoji.
            </Typography>
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                TBD DISCLAIMER
            </Typography>

            <Box
                sx={{
                    height: "1200px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveBar
                    data={emojiCounts}
                    keys={senders}
                    indexBy="emoji"
                    layout="horizontal"
                    margin={{ top: 60, right: 140, bottom: 60, left: 100 }}
                    valueScale={{ type: "linear" }}
                    indexScale={{ type: "band", round: true }}
                    colors={{ scheme: "nivo" }}
                    axisTop={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "Number of uses",
                        legendPosition: "middle",
                        legendOffset: -45,
                    }}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 45,
                        legend: "Number of uses",
                        legendPosition: "middle",
                        legendOffset: 45,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Emoji",
                        legendPosition: "middle",
                        legendOffset: -80,
                    }}
                    enableGridX={true}
                    enableGridY={false}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    tooltipLabel={(e) => "Number of uses"}
                    legends={[
                        {
                            dataFrom: "keys",
                            anchor: "top-right",
                            direction: "column",
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: "left-to-right",
                            itemOpacity: 0.85,
                            symbolSize: 15,
                            toggleSerie: true,
                            effects: [
                                {
                                    on: "hover",
                                    style: {
                                        itemOpacity: 1,
                                    },
                                },
                            ],
                        },
                    ]}
                    role="application"
                />
            </Box>
        </Box>
    );
}

export default TopEmojisUsed;
