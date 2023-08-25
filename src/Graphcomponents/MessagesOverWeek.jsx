import { Box, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { useEffect, useMemo, useState } from "react";
import useFeedbackMachine from "../FeedbackMachine/useFeedbackMachine";

/**
 *
 * @param {Object} props
 * @param {import("data-forge").DataFrame} props.chatData
 * @param {import("data-forge").DataFrame} props.chatDataWithoutMedia
 * @returns {JSX.Element}
 */
function MessagesOverWeek({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("../calcWorkers/MessagesOverWeek.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [convertedData, setConvertedData] = useState([]);
    const [senders, setSenders] = useState([]);

    useEffect(() => {
        if (chatData !== "") {
            setLoading(true);
            worker.postMessage({ chatData });
        }
    }, [chatData]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setConvertedData(result.messageCount);
            setSenders(result.senders);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography textAlign="center" variant="h3" gutterBottom>
                Messages over week
            </Typography>

            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                Now we do the same as above, but instead of hours per day we look at days per week.
                This graph shows the number of messages sent by each person over the days of a week.
                The messages are grouped by the week day they were sent in. The graph is
                interactive, you can click on the legend to hide/show the data for a specific
                person.
            </Typography>
            <Box
                sx={{
                    height: "400px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveBar
                    data={convertedData}
                    keys={senders}
                    indexBy="day"
                    margin={{ top: 20, right: 140, bottom: 80, left: 70 }}
                    valueScale={{ type: "linear" }}
                    indexScale={{ type: "band", round: true }}
                    colors={{ scheme: "nivo" }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 45,
                        legend: "Day of week",
                        legendPosition: "middle",
                        legendOffset: 65,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Message Count",
                        legendPosition: "middle",
                        legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    tooltipLabel={(e) => e.indexValue + " 00:00 to " + e.indexValue + " 23:59"}
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

export default MessagesOverWeek;
