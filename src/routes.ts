import { Router } from "express";
import { getInfos, getLinks } from "./puppeter/scrapperInfos";
import { details } from "./controller/constrollerJob";




const route = Router()

route.get("/scrapperLinks", getLinks)
route.get("/scrapperInfos", getInfos)
route.get("/details", details)
export default route;