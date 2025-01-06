import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strict_output } from "./gpt";

export async function searchYoutube(searchQuery: string) {
  // hello world => hello+world
  searchQuery = encodeURIComponent(searchQuery);
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
  );
  if (!data) {
    console.log("youtube fail");
    return null;
  }
  if (data.items[0] == undefined) {
    console.log("youtube fail");
    return null;
  }
  return data.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    let transcript = "";
    for (let t of transcript_arr) {
      transcript += t.text + " ";
    }
    return transcript.replaceAll("\n", "");
  } catch (error) {
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };
  const questions: Question[] = await strict_output(
    "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words",
    new Array(5).fill(
      `You are to generate a random hard mcq question about ${course_title} with context of the following transcript: ${transcript}`
    ),
    {
      question: "question",
      answer: "answer with max length of 15 words",
      option1: "option1 with max length of 15 words",
      option2: "option2 with max length of 15 words",
      option3: "option3 with max length of 15 words",
    }
  );
  return questions;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getRelatedVideos(videoId: string) {
  try {
    // First get the main video info to get the title/topic
    const mainVideoOptions = {
      method: 'GET',
      url: 'https://yt-api.p.rapidapi.com/video/info',
      params: { id: videoId },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'yt-api.p.rapidapi.com'
      }
    };

    const mainVideoResponse = await axios.request(mainVideoOptions);
    
    // Extract keywords or title for search
    const searchQuery = mainVideoResponse.data.keywords?.[0] || mainVideoResponse.data.title;

    // Search for related videos
    const searchOptions = {
      method: 'GET',
      url: 'https://yt-api.p.rapidapi.com/search',
      params: {
        query: searchQuery,
        type: 'video',
        maxResults: '10' // Request more to have room for filtering
      },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'yt-api.p.rapidapi.com'
      }
    };

    await delay(1000); // Add delay to avoid rate limiting

    const searchResponse = await axios.request(searchOptions);
    
    if (!searchResponse.data || !searchResponse.data.data) {
      console.error('No search results found');
      return [];
    }

    // Filter and format the videos
    const relatedVideos = searchResponse.data.data
      .filter((item: any) => item.videoId !== videoId) // Exclude the main video
      .slice(0, 3) // Get exactly 3 videos
      .map((item: any) => ({
        videoId: item.videoId,
        title: item.title,
        thumbnail: item.thumbnail?.[0]?.url || ''
      }));

    console.log('Successfully fetched related videos:', relatedVideos);
    return relatedVideos;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        console.error('Rate limit exceeded. Please wait before making more requests.');
      } else {
        console.error('API Error:', {
          status: error.response?.status,
          message: error.response?.data
        });
      }
    } else {
      console.error('Error fetching related videos:', error);
    }
    return [];
  }
}