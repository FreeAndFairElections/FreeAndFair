import Axios from 'axios';
import { LocationObject } from 'expo-location';
import { Action, Dispatch } from '../actions/Actions';
import { Form as JoyFormData } from '../components/screens/JoyReport';
import { Log } from '../types/AppState';
import { UserData } from '../types/UserData';
import qs from 'qs'


const seeSay2020 = "https://services8.arcgis.com/3Y7J7SmaNLGLT6ec/arcgis/rest/services/See_Say_2020_survey/FeatureServer/applyEdits"

const axios = Axios.create({
})
// axios.defaults.headers.post["Content-type"] = "application/x-www-form-urlencoded"

export const submitJoy: (u: UserData, f: JoyFormData, l: LocationObject, d: Dispatch, lg: Log) => Promise<void> =
  async (userData, formData, location, dispatch, log) => {
    const body = qs.stringify({
      f: "json",
      edits: JSON.stringify([
        {
          id: 0,
          "adds": [
            {
              attributes:
              {
                urgency: null,
                polling_location: null,
                review_comments: null,
                Check1: null,
                Check2: null,
                Check3: null,
                mediaworthy: null,
                infosource: null,
                volunteer_code: null,

                // Group code
                poll_monitor: userData.groupCode || null,

                name: userData.name,
                phone: userData.phoneNumber,
                email: userData.email || null,

                ...formData,
                incident_time: parseInt(formData.incident_time),

                geometry: {
                  geometryType: "esriGeometryPoint",
                  x: location.coords.longitude,
                  y: location.coords.latitude,
                  spatialReference: {
                    wkid: 4326
                  }
                },
              }
            }
          ],
        },
      ]),
      useGlobalIds: true,
      rollbackOnFailure: true,
    })

    axios.post(seeSay2020, body, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "origin": "https://survey123.arcgis.com",
        "referer": "https://survey123.arcgis.com/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
      }
    })
      .then((value) => {
        log(`\nPosted to SeeSay2020: \n${JSON.stringify(value, null, 2)}`)
        dispatch({ type: Action.SnackbarMessage, message: "Submission completed" })
      }, (error) => {
        log(`Failed posting to SeeSay2020: ${JSON.stringify(error, null, 2)}`)
        dispatch({ type: Action.SnackbarMessage, message: "Failed during submission" })
      })
  }