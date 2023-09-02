import { ResponsiveLine } from "@nivo/line";
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
function MessagesOverTime({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("./MessagesOverTime.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [messagesOverTime, setMessagesOverTime] = useState([]);
    const [cumMessagesOverTime, setCumMessagesOverTime] = useState([]); // Cumulative messages over time

    useEffect(() => {
        if (chatData !== "") {
            setLoading(true);
            worker.postMessage({ chatData });
        }
    }, [chatData]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setMessagesOverTime(result.messagesOverTime);
            setCumMessagesOverTime(result.cumMessagesOverTime);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography textAlign="center" variant="h3" gutterBottom>
                Messages over time
            </Typography>

            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                The next thing we can do is to look at the messages over time. This is also a pretty
                simple thing that can also be very informative. It is a good way to see how and
                during which time periods the chat was active.
            </Typography>
            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                The first graph shows for each day how many messages were sent. When this graph
                shows a big number of bug spikes this means that the chat was (in this time period)
                very active. Little and few spikes mean less activity. When there is no datapoint
                for a day, it means that no messages were sent on that day.
            </Typography>
            
            <Box
                sx={{
                    height: "400px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveLine
                    data={messagesOverTime}
                    margin={{ top: 20, right: 10, bottom: 90, left: 70 }}
                    xScale={{ type: "time", format: "%Y-%m-%d", min: "auto", max: "auto" }}
                    yScale={{
                        type: "linear",
                        min: "auto",
                        max: "auto",
                        stacked: true,
                        reverse: false,
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        format: "%d.%m.%Y",
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "time",
                        legendOffset: 66,
                        legendPosition: "middle",
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "messages",
                        legendOffset: -60,
                        legendPosition: "middle",
                    }}
                    xFormat="time:%d.%m.%Y"
                    yFormat={(value) => value + " messages"}
                    pointSize={3}
                    pointColor={{ theme: "background" }}
                    pointBorderWidth={1}
                    pointBorderColor={{ from: "serieColor" }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                />
            </Box>

            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                The second graph shows how the total number of messages in the chat developed over
                time. It is maybe important to note that the graph does not show the number of
                messages sent per day, but the total number of messages sent until that day. This
                means that the graph will always go up and never down. When there is no datapoint
                for a day, it means that no messages were sent on that day.
            </Typography>

            <Box
                sx={{
                    height: "400px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveLine
                    data={cumMessagesOverTime}
                    margin={{ top: 20, right: 10, bottom: 90, left: 70 }}
                    xScale={{ type: "time", format: "%Y-%m-%d", min: "auto", max: "auto" }}
                    yScale={{
                        type: "linear",
                        min: "auto",
                        max: "auto",
                        stacked: true,
                        reverse: false,
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        format: "%d.%m.%Y",
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "time",
                        legendOffset: 66,
                        legendPosition: "middle",
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "messages",
                        legendOffset: -60,
                        legendPosition: "middle",
                    }}
                    xFormat="time:%d.%m.%Y"
                    yFormat={(value) => value + " messages"}
                    pointSize={3}
                    pointColor={{ theme: "background" }}
                    pointBorderWidth={1}
                    pointBorderColor={{ from: "serieColor" }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                />
            </Box>
        </Box>
    );
}

export default MessagesOverTime;
