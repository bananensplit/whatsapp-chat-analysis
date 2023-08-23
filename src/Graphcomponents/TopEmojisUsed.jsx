import { Box, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { useEffect, useState, useMemo } from "react";
import * as dataForge from "data-forge";
import useFeedbackMachine from "../FeedbackMachine/useFeedbackMachine";

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
            new Worker(new URL("../calcWorkers/TopEmojisUsed.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [convertedData, setConvertedData] = useState([]);
    const [senders, setSenders] = useState([]);

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            fetch("/emoji.csv")
                .then((r) => r.text())
                .then((text) => dataForge.fromCSV(text).toJSON())
                .then((emoji) => worker.postMessage({ chatDataWithoutMedia, emoji }));
        }
    }, [chatDataWithoutMedia]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setConvertedData(result.emojiCounts);
            setSenders(result.senders);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography align="center" variant="h3" gutterBottom>
                Top 50 emojis used
            </Typography>
            <Typography
                sx={{ mr: "20px", ml: "20px", textAlign: "justify" }}
                variant="body1"
                gutterBottom
            >
                TBD
            </Typography>
            <Box
                sx={{
                    height: "1200px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveBar
                    data={convertedData}
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
                        legend: "Character",
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
