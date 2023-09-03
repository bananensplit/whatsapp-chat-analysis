import { Box, Typography } from "@mui/material";
import { ResponsiveSunburst } from "@nivo/sunburst";
import { useEffect, useMemo, useState } from "react";
import useFeedbackMachine from "../../FeedbackMachine/useFeedbackMachine";

/**
 *
 * @param {Object} props
 * @param {import("data-forge").DataFrame} props.chatData
 * @param {import("data-forge").DataFrame} props.chatDataWithoutMedia
 * @returns {JSX.Element}
 */
function NumberOfChars({ chatData, chatDataWithoutMedia }) {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("./NumberOfChars.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [totalChars, setTotalChars] = useState("-");
    const [totalCharsBySender, setTotalCharsBySender] = useState({});

    // const [convertedData, setConvertedData] = useState([]);
    // const [senders, setSenders] = useState([]);

    useEffect(() => {
        if (chatDataWithoutMedia !== "") {
            setLoading(true);
            worker.postMessage({ chatDataWithoutMedia });
        }
    }, [chatData]);

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setTotalChars(result.totalChars);
            setTotalCharsBySender(result.totalCharsBySender);
            setLoading(false);
        };
    }, [worker]);

    return (
        <Box>
            <Typography textAlign="center" variant="h3" gutterBottom>
                Number of characters
            </Typography>

            <Typography mr="20px" ml="20px" textAlign="justify" variant="body1" gutterBottom>
                In total there are <b style={{ fontSize: "large" }}>{totalChars}</b> characters in
                this chat. The following chart shows the distribution of this characters among the senders.
            </Typography>

            <Box
                sx={{
                    height: "300px",
                    width: "100%",
                }}
                fontFamily={"Arial"}
            >
                <ResponsiveSunburst
                    data={totalCharsBySender}
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
                />{" "}
            </Box>
        </Box>
    );
}

export default NumberOfChars;
