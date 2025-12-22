export type Article = {
  name: string;
  avatarLink: string;
  dateTimeStart: string;
  content: string;
  userCode: string;
};

export type NewsItem = {
  id: string;
  name: string;
  avatarLink: string;
};

export type NewsGroup = {
  groupName: string;
  detail: NewsItem[];
};
