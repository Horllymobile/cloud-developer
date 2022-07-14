import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
// import { S3EventRecord } from 'aws-lambda'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const imagesBucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export function getAttachmentUrl(attachmentId: string): string {
    return `https://${imagesBucketName}.s3.amazonaws.com/${attachmentId}`
}

export async function createAttachmentPresignedUrl(id: string) {
    const uploadUrl = await s3.getSignedUrl('putObject', {
        Bucket: imagesBucketName,
        Key: id,
        Expires: Number(urlExpiration)
    })
    return uploadUrl
}
