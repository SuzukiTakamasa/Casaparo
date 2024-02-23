import { Hono } from "hono"
import LINEMessagingAPIHandler from "./api_handler"

const app = new Hono()

app.post("/reply_message")