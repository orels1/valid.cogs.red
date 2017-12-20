import { filter, map, compact } from 'lodash';

// const TOKEN = '';
const API_ROOT = 'https://api.github.com';
const headers = {
  // Authorization: `bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export const repoInfo = async (username, repo) => {
  const url = `${API_ROOT}/repos/${username}/${repo}/contents/info.json`;
  const response = await fetch(url, { headers });
  if (response.status === 404) return 'notFound';
  const json = await response.json();
  let info = {};
  try {
    info = JSON.parse(atob(json.content));
  } catch (e) {
    return null;
  }
  return info;
};

export const listCogs = async (username, repo) => {
  const response = await fetch(`${API_ROOT}/repos/${username}/${repo}/contents`, { headers });
  if (response.status === 404) return Promise.reject('NotFound');
  const json = await response.json();
  const cogs = filter(json, { type: 'dir' });
  return map(cogs, cog => cog.name);
};

export const cogInfo = async (username, repo, cog, tree = 'master') => {
  const response = await fetch(`${API_ROOT}/repos/${username}/${repo}/contents/${cog}/info.json?ref=${tree}`, { headers });
  if (response.status === 404) return false;
  const json = await response.json();
  let info = {};
  try {
    info = JSON.parse(atob(json.content));
  } catch (e) {
    return null;
  }
  return info;
};

export const parseCogs = async (username, repo, branch = 'master') => {
  let cogs = await listCogs(username, repo);

  const cogsInfo = await Promise.all(cogs.map(c => cogInfo(username, repo, c, branch)));

  cogs = cogs.map((c, index) => ({
    name: c,
    info: cogsInfo[index],
  }));

  const broken = [];
  const missing = [];

  cogs = compact(map(cogs, (c) => {
    if (c.info && c.info !== null) return c;
    if (c.info === null) {
      broken.push(c.name);
      return null;
    }
    missing.push(c.name);
    return null;
  }));

  return { cogs, broken, missing };
};
