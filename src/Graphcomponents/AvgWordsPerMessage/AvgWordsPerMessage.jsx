import { ResponsiveBar } from "@nivo/bar";
import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import useFeedbackMachine from "../../FeedbackMachine/useFeedbackMachine";

/**
 *
 * @param {Object} props
 * @param {import("data-forge").DataFrame} props.chatData
 * @param {import("data-forge").DataFrame} props.chatDataWithoutMedia
 * @returns {JSX.Element}
 */
function AvgWordsPerMessage({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("./AvgWordsPerMessage.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [sender, setSender] = useState([]);
    const [totalAvgWordsPerMessage, setTotalAvgWordsPerMessage] = useState("-");
    const [avgWordsPerMessage, setAvgWordsPerMessage] = useState([]);

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            worker.postMessage({ chatDataWithoutMedia });
        }
    }, [chatDataWithoutMedia]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setSender(result.sender);
            setTotalAvgWordsPerMessage(result.totalAvgWordsPerMessage);
            setAvgWordsPerMessage(result.avgWordsPerMessage);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography textAlign="center" variant="h3" gutterBottom>
                Average words per message
            </Typography>

            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                This analysis looks at the average number of words per message sent by each sender.
                Overall there is an average of about{" "}
                <b style={{ fontSize: "large" }}>{totalAvgWordsPerMessage} words</b> per message.
            </Typography>
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                In the graph below the messages were grouped by sender and by hour of day.
            </Typography>

            <Box
                sx={{
                    height: "400px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveBar
                    data={avgWordsPerMessage}
                    keys={sender}
                    indexBy="hour"
                    groupMode="grouped"
                    margin={{ top: 20, right: 140, bottom: 60, left: 70 }}
                    valueScale={{ type: "linear" }}
                    indexScale={{ type: "band", round: true }}
                    colors={{ scheme: "nivo" }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 45,
                        format: (e) => e + ":00",
                        legend: "Hour of day",
                        legendPosition: "middle",
                        legendOffset: 45,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Average Words Per Message",
                        legendPosition: "middle",
                        legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    tooltipLabel={(e) => e.indexValue + ":00 to " + e.indexValue + ":59"}
                    legends={[
                        {
                            dataFrom: "keys",
                            anchor: "bottom-right",
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

export default AvgWordsPerMessage;
