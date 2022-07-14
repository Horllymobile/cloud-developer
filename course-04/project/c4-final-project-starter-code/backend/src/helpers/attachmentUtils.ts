import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
// import { S3EventRecord } from 'aws-lambda'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export function createAttachmentPresignedUrl(id: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: imagesBucketName,
        Key: id,
        Expires: urlExpiration
    })
}
