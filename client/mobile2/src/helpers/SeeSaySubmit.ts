import Axios from 'axios';
import { LocationObject } from 'expo-location';
import { Action, Dispatch } from '../actions/Actions';
import { Log } from '../types/AppState';
import { UserData } from '../types/UserData';
import qs from 'qs'
import SeeSay2020Submission from '../types/SeeSay2020Submission'
import { Photo } from '../components/Photos';
import uuid from 'react-native-uuid';
import * as FileSystem from 'expo-file-system';
// import * as FormData from 'form-data';
// import {FormData} from 'react-native'

const seeSay2020 = (path: string) => `https://services8.arcgis.com/3Y7J7SmaNLGLT6ec/arcgis/rest/services/See_Say_2020_survey/FeatureServer/${path}`
const s3Bucket = (path: string) => `http://s3.amazonaws.com/f-and-f-beta/uploads/${path}`

const axios = Axios.create({
})

export const submitToSeeSay2020: (u: UserData, f: SeeSay2020Submission, l: LocationObject, d: Dispatch, lg: Log) => Promise<void> =
  async (userData, formData, location, dispatch, log) => {
    const uploads = await Promise.all((formData.photos || []).map((p, i) => uploadToSeeSay2020(p, log)))
    const s3Uploads = await Promise.all((formData.photos || []).map((p, i) => uploadToS3(p, log)))

    const attachments = formData.photos ? {
      attachments: {
        adds:
          formData.photos.map((p, i, a) => {
            return {
              globalId: s3Uploads[i] ? `${s3Uploads[i]}` : `{${uuid.v4().toUpperCase()}}`,
              parentGlobalId: formData.globalid,
              keywords: "photo",
              contentType: "image/jpeg",
              name: "photo.jpg",
              uploadId: uploads[i]?.item.itemID || "upload_failed",
            }
          })
      }
    } : {}

    const item = {
      id: 0,
      adds: [
        {
          attributes: {
            urgency: null,
            polling_location: null,
            review_comments: null,
            Check1: null,
            Check2: null,
            Check3: null,
            mediaworthy: null,
            infosource: null,
            volunteer_code: null,
            action_code: null,

            // Group code
            poll_monitor: userData.groupCode || null,

            name: userData.name,
            phone: userData.phoneNumber,
            email: userData.email || null,

            ...formData,
            ...((formData.issue_subtype === "NULLL") ? { issue_subtype: null } : {}),
            photos: undefined,  // We'll handle this separately...

            incident_time: parseInt(formData.incident_time),
          },
          geometry: {
            geometryType: "esriGeometryPoint",
            x: location.coords.longitude,
            y: location.coords.latitude,
            spatialReference: {
              wkid: 4326
            }
          },
        }
      ],
      ...attachments,
    }

    const body = qs.stringify({
      f: "json",
      edits: JSON.stringify([item]),
      useGlobalIds: true,
      rollbackOnFailure: true,
    })

    axios.put(s3Bucket(`submissions/${formData.globalid}`), body, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "Free And Fair Elections (mobile app)"
      }
    })

    log(`Posting adds: ${JSON.stringify(item, null, 2)}`)
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
        axios.put(s3Bucket(`postResults/success/${formData.globalid}`), qs.stringify(value), {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "user-agent": "Free And Fair Elections (mobile app)"
          }
        })
        // TODO(Dave): Hit the webhook here
        const hookBody = {
          applyEdits: [item],
          response: value.data,
          feature: {
            ...item,
            layerInfo: {
              id: 0,
              name: "See_Say_2020_new_survey",
              type: "Feature Layer",
              globalIdField: "globalid",
              objectIdField: "objectid",
            },
            result: {
              globalId: formData.globalid,
              objectId: value.data[0].addResults[0].objectId,
              uniqueId: value.data[0].addResults[0].objectId,
              success: true
            },
            geometry: item.adds[0].geometry,
            attachments: {
              photo: uploads.map((u, i) => u ? {
                id: value.data[0].attachments.addResults[i].objectId,
                url: `https://services8.arcgis.com/3Y7J7SmaNLGLT6ec/arcgis/rest/services/See_Say_2020_survey/FeatureServer/0/${value.data[0].addResults[0].objectId}/attachments/${value.data[0].attachments.addResults[i].objectId}`,
                name: u.item.itemName,
                contentType: "image/jpeg",
                keywords: "photo",
                globalId: s3Uploads[i],
                parentGlobalId: formData.globalid,
              } : {})
            },
          },
          eventType: "addData",
          portalInfo: {
            url: "https://www.arcgis.com",
            token: null,
          },
          surveyInfo: {
            formItemId: "no-idea",
            formTitle: "See Say 2020 form",
            serviceItemId: "no-idea",
            serviceUrl: "https://services8.arcgis.com/3Y7J7SmaNLGLT6ec/arcgis/rest/services/See_Say_2020_survey/FeatureServer",
          },
        }

        axios.post(
          "https://hook.integromat.com/2747htbgh59l4h7z8is0zei8sb4ewhly",
          qs.stringify(hookBody),
          {
            headers: {
              "origin": "https://survey123.arcgis.com",
              "referer": "https://survey123.arcgis.com/",
              "user-agent": "Free And Fair Elections (mobile app)",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            }
          })
          .then(response => ({}), error => {
            log(`webhook failed: ${JSON.stringify(error, null, 2)}`)
            return null
          })
      }, (error) => {
        log(`Failed posting to SeeSay2020: ${JSON.stringify(error, null, 2)}`)
        dispatch({ type: Action.SnackbarMessage, message: "Failed during submission" })
        axios.put(s3Bucket(`postResults/failure/${formData.globalid}`), qs.stringify(error), {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "user-agent": "Free And Fair Elections (mobile app)"
          }
        })

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
    form.append("file", {
      uri: photo.uri,
      name: `photo.jpg`,
      type: `image/jpeg`
    } as any)  // react-native supports this form of `FormData.append()`, despite it not being typed as such.

    return axios.put<SeeSay2020UploadResponse>(
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

type UUID = string
export const uploadToS3: (photo: Photo, lg: Log) => Promise<UUID | null> =
  (photo, log) => {
    const id = uuid.v4().toUpperCase()

    return FileSystem.uploadAsync(
      s3Bucket(`attachments/{${id}}`),
      photo.uri,
      {
        httpMethod: "PUT"
      }
    ).then((value) => {
      log(`\nUploaded to S3: \n${JSON.stringify(value, null, 2)}`)
      // dispatch({ type: Action.SnackbarMessage, message: "Submission completed" })
      return `{${id}}`
    }, (error) => {
      log(`Failed uploading to S3: ${JSON.stringify(error, null, 2)}`)
      // dispatch({ type: Action.SnackbarMessage, message: "Failed during submission" })
      return null
    })
  }