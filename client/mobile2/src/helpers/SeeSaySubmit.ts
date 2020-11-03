import Axios from 'axios';
import { LocationObject } from 'expo-location';
import { Action, Dispatch } from '../actions/Actions';
import { Log } from '../types/AppState';
import { UserData } from '../types/UserData';
import qs from 'qs'
import SeeSay2020Submission from '../types/SeeSay2020Submission'
import { Photo } from '../components/Photos';
import uuid from 'react-native-uuid';
// import * as FormData from 'form-data';
// import {FormData} from 'react-native'

const seeSay2020 = (path: string) => `https://services8.arcgis.com/3Y7J7SmaNLGLT6ec/arcgis/rest/services/See_Say_2020_survey/FeatureServer/${path}`

const axios = Axios.create({
})

export const submitToSeeSay2020: (u: UserData, f: SeeSay2020Submission, l: LocationObject, d: Dispatch, lg: Log) => Promise<void> =
  async (userData, formData, location, dispatch, log) => {
    const uploads = await Promise.all((formData.photos || []).map((p, i) => uploadToSeeSay2020(p, log)))

    const attachments = formData.photos ? {
      attachments: {
        adds:
          formData.photos.map((p, i, a) => {
            return {
              globalId: `{${uuid.v4()}}`,
              parentGlobalId: formData.globalid,
              keywords: "photo",
              contentType: "image/jpeg",
              name: "photo.jpg",
              uploadId: uploads[i]?.item.itemID || "upload_failed",
            }
          })
      }
    } : {}

    const body = qs.stringify({
      f: "json",
      edits: JSON.stringify([
        {
          id: 0,
          adds: [
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
                ...((formData.issue_subtype === "NULLL") ? { issue_subtype: null } : {}),
                photos: undefined,  // We'll handle this separately...

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
          ...attachments,
        },
      ]),
      useGlobalIds: true,
      rollbackOnFailure: true,
    })

    axios.post(seeSay2020("applyEdits"), body, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "origin": "https://survey123.arcgis.com",
        "referer": "https://survey123.arcgis.com/",
        "user-agent": "Free And Fair Elections (mobile app)"
      }
    })
      .then((value) => {
        log(`\nPosted to SeeSay2020: \n${JSON.stringify(value.data, null, 2)}`)
        dispatch({ type: Action.SnackbarMessage, message: "Submission completed" })
      }, (error) => {
        log(`Failed posting to SeeSay2020: ${JSON.stringify(error, null, 2)}`)
        dispatch({ type: Action.SnackbarMessage, message: "Failed during submission" })
      })
  }

export type SeeSay2020UploadResponse = {
  item: {
    itemID: string,
    itemName: string,
    serviceName: string,
  },
  success: boolean,
}
export const uploadToSeeSay2020: (photo: Photo, lg: Log) => Promise<SeeSay2020UploadResponse | null> =
  async (photo, log) => {
    const form = new FormData();
    form.append("f", "json")
    // log(`image b64 is length ${photo.base64?.length}`)
    // const blob = await b64toBlob(photo.base64!.replace(/(\s|\r\n|\r|\n)/g, ''), "image/jpeg")
    // form.append("file", blob)
    form.append("file", {
      uri: photo.uri,
      name: `photo.jpg`,
      type: `image/jpeg`
    } as any)  // react-native supports this form of `FormData.append()`, despite it not being typed as such.
    // log("added to FormData")

    return axios.post<SeeSay2020UploadResponse>(
      seeSay2020("uploads/upload"),
      form, {
      headers: {
        // ...form.getHeaders(),
        "origin": "https://survey123.arcgis.com",
        "referer": "https://survey123.arcgis.com/",
        "user-agent": "Free And Fair Elections (mobile app)",
        'Content-Type': 'multipart/form-data',
      }
    })
      .then((value) => {
        log(`\nUploaded to SeeSay2020: \n${JSON.stringify(value.data, null, 2)}`)
        // dispatch({ type: Action.SnackbarMessage, message: "Submission completed" })
        return value.data
      }, (error) => {
        log(`Failed uploading to SeeSay2020: ${JSON.stringify(error, null, 2)}`)
        // dispatch({ type: Action.SnackbarMessage, message: "Failed during submission" })
        return null
      })
  }