import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import {
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { MuiFileInput } from "mui-file-input";
import { useEffect, useMemo, useState } from "react";
import useFeedbackMachine from "./FeedbackMachine/useFeedbackMachine";
import TopCharactersUsed from "./Graphcomponents/TopCharactersUsed";
import Introduction from "./Graphcomponents/Introduction";
import LongestMessage from "./Graphcomponents/LongestMessage";
import MessagesOverDay from "./Graphcomponents/MessagesOverDay";
import MessagesOverWeek from "./Graphcomponents/MessagesOverWeek";
import TopWordsUsed from "./Graphcomponents/TopWordsUsed";
import TopEmojisUsed from "./Graphcomponents/TopEmojisUsed";
import NumberOfMessages from "./Graphcomponents/NumberOfMessages";
import MessagesOverTime from "./Graphcomponents/MessagesOverTime";

function App() {
    const { setLoading, loading, addSuccess, addError } = useFeedbackMachine();
    const worker = useMemo(
        () =>
            new Worker(new URL("./calcWorkers/ConvertTxtToChat.worker.jsx", import.meta.url), {
                type: "module",
            }),
        []
    );

    const [chatData, setChatData] = useState("");
    const [chatDataWithoutMedia, setChatDataWithoutMedia] = useState("");
    // const [file, setFile] = useState(null);
    const [file, setFile] = useState("null");

    useEffect(() => runAnalysis(), []);

    function runAnalysis() {
        if (file === null) return;
        setLoading(true);
        fetch("tempdata.txt").then((r) => r.text())
            // file.text()
            .then((text) => worker.postMessage(text))
            .catch((error) => console.error(error));
    }

    useEffect(() => {
        worker.onmessage = (message) => {
            const result = message.data;
            setChatData(result.chatData);
            setChatDataWithoutMedia(result.chatDataWithoutMedia);
            setLoading(false);
        };
    }, [worker]);

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    margin: "0 auto",
                    padding: "0 20px",
                    maxWidth: "900px",

                    display: "flex",
                    flexDirection: "column",
                    // gap: "70px",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        height: "94vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h1" gutterBottom>
                        📈 WhatsApp Chat Analysis
                    </Typography>

                    <Chip sx={{ mb: "20px" }} label="BETA VERSION" color="primary" />

                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid xs={12} md={6}>
                            <Stepper orientation="vertical">
                                {[
                                    [
                                        "Export and download the Whatsapp chat",
                                        <>
                                            <a href="https://faq.whatsapp.com/1180414079177245/?cms_platform=android">
                                                Here
                                            </a>{" "}
                                            is a short guide on how to do it. <br />
                                            Choose the option "Without Media".
                                        </>,
                                    ],
                                    [
                                        "Upload the exported file",
                                        "Click on uploadfield below and select the file you just downloaded.",
                                    ],
                                    ["Run the analysis"],
                                ].map((step) => (
                                    <Step key={step[0]} active>
                                        <StepLabel>{step[0]}</StepLabel>
                                        <StepContent>
                                            <Typography>{step[1] || ""}</Typography>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                            <MuiFileInput
                                size="medium"
                                sx={{ mt: "20px" }}
                                placeholder={"Select your WhatsApp chat file"}
                                value={file}
                                onChange={setFile}
                            />
                        </Grid>
                        <Grid xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: "10px" }}>
                                <Typography
                                    variant="h4"
                                    sx={{ display: "flex", alignItems: "center" }}
                                >
                                    <ErrorOutlineRoundedIcon color="error" sx={{ mr: "5px" }} />
                                    Disclaimer
                                </Typography>
                                <Typography variant="body2">
                                    This is a <b>personal project</b> and{" "}
                                    <b>not affiliated with WhatsApp</b> or any other company.
                                    <br />
                                    The <b>data is only stored in your browser</b> (locally on your
                                    device). No requests containing any data that you upload to this
                                    website leave your device. Every <b>analysis that is done</b>,
                                    is done <b>locally in your browser</b>. <br />
                                    If you have any <b>doubts regarding your privacy</b>, the whole{" "}
                                    <b>source code </b>
                                    that powers this website is available on{" "}
                                    <b>
                                        <a href="https://github.com/bananensplit">Github</a>
                                    </b>
                                    . You can also just download the source code and run it locally
                                    on your device. If you{" "}
                                    <b>still think that your privacy is not guaranteed</b>, or
                                    something fishy is going on, please{" "}
                                    <b>REFRAIN FROM USING THIS WEBSITE</b>.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Button
                        sx={{
                            mt: "20px",
                            height: "50px",
                            width: "200px",
                        }}
                        size="large"
                        color="success"
                        variant="contained"
                        disabled={file === null}
                        onClick={runAnalysis}
                    >
                        Run the analysis
                    </Button>
                </Box>

                {chatData && chatDataWithoutMedia && (
                    <>
                        <Typography textAlign="center" variant="h2" gutterBottom>
                            Messages
                        </Typography>
                        {[
                            "This is the first section of the analysis. It contains all the data about the messages in the chat: How many messages were sent? What was the longest message? Who sent how many messages? And so on. More granular data about the messages can be found in the following sections, where we go on the word and even character level.",
                            "So let's get started and take a look at your chat like you have never done before.",
                        ].map((i) => (
                            <Typography
                                sx={{ mr: "20px", ml: "20px" }}
                                textAlign="justify"
                                variant="body1"
                                gutterBottom
                            >
                                {i}
                            </Typography>
                        ))}
                        <Divider sx={{ mt: "30px", mb: "30px" }} />

                        <NumberOfMessages
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />

                        <MessagesOverDay
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />

                        <MessagesOverWeek
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />

                        <LongestMessage
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />

                        <MessagesOverTime
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />


                        <Divider sx={{ mt: "60px", mb: "60px" }} />


                        <Typography textAlign="center" variant="h2" gutterBottom>
                            TO BE PRETTIFIED
                        </Typography>
                        {[
                            "This section is for the graphs that aren't finished yet.",
                            "Maybe the data is not calculated (very) correctly or the description is missing/incorrect. Altough the data is not correct, it is still interesting to look at the graphs and see what they are supposed to show.",
                        ].map((i) => (
                            <Typography
                                sx={{ mr: "20px", ml: "20px" }}
                                textAlign="justify"
                                variant="body1"
                                gutterBottom
                            >
                                {i}
                            </Typography>
                        ))}
                        <Divider sx={{ mt: "30px", mb: "30px" }} />
                        
                        <Introduction
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />
                        
                        <TopWordsUsed
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />
                        
                        <TopCharactersUsed
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                        <Divider sx={{ mt: "30px", mb: "30px" }} />

                        <TopEmojisUsed
                            chatData={chatData}
                            chatDataWithoutMedia={chatDataWithoutMedia}
                        />
                    </>
                )}
            </Box>
        </>
    );
}

export default App;
