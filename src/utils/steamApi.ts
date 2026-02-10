export interface NewsItem {
    gid: string;
    title: string;
    url: string;
    is_external_url: boolean;
    author: string;
    contents: string;
    feedlabel: string;
    date: number;
    feedname: string;
    feed_type: number;
    appid: number;
}

export interface NewsResponse {
    appnews: {
        appid: number;
        newsitems: NewsItem[];
        count: number;
    };
}