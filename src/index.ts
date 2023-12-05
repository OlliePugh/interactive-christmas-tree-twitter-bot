import takeScreenshot from "./take-screenshot";
import { TwitterApi, EUploadMimeType } from "twitter-api-v2";
import axios from "axios";
import Jimp from "jimp";
import "dotenv/config";

const formatDateTime = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const ordinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const formattedDate = `${day}${ordinalSuffix(day)} of ${month} ${year}`;
  const formattedTime = `${hours}:${minutes}`;

  return `${formattedDate} at ${formattedTime}`;
};

const client = new TwitterApi({
  //@ts-ignore
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
  bearerToken: process.env.TWITTER_BEARER,
});
const baubleBuffer = async (id: number) => {
  console.log(`getting bauble ${id}`);
  const result = await axios.get(
    `https://europe-west1-real-world-games.cloudfunctions.net/getBaubleBmp?id=${id}`,
    {
      responseType: "arraybuffer",
    }
  );
  console.log(`downloaded bauble ${id}`);

  const image = await Jimp.read(result.data);
  const resized = image.resize(640, 480);
  const png = resized.getBufferAsync(Jimp.MIME_PNG);

  console.log("converted to png");
  return png;
};

const addMedia = async (buffer: Buffer): Promise<string> => {
  const mediaId = await client.v1.uploadMedia(buffer, {
    mimeType: EUploadMimeType.Png,
  });
  console.log(`uploaded media with id ${mediaId}`);
  return mediaId;
};

const postTweet = async () => {
  const imagePromises = [
    takeScreenshot(),
    baubleBuffer(1),
    baubleBuffer(2),
    baubleBuffer(3),
  ];

  const uploadPromises = (await Promise.all(imagePromises)).map((x) =>
    addMedia(x)
  );

  const mediaIds = await Promise.all(uploadPromises);

  console.log(`media ids: ${mediaIds}`);

  await client.v2.tweet({
    text: `Current status of the Interactive Christmas Tree as of the ${formatDateTime(
      new Date()
    )}\n\nControl the tree yourself at interactive-christmas-tree.com\n\n#interactivechristmastree #christmas #interactive #christmastree`,
    media: { media_ids: mediaIds as string[] },
  });
  console.log("done");
};

postTweet();
