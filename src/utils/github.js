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

export const graphql = async (username, repo) => {
  const query = `
    query {
      repoFiles: repository(name: "${repo}", owner: "${username}") {
        object(expression: "master:") {
          ... on Tree {
            entries {
              name
              type
              object {
                ... on Blob {
                  text
                }
              }
              object {
                ... on Tree {
                  entries {
                    name
                    type
                    object {
                      ... on Blob {
                        text
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  try {
    const resp = await fetch(`${API_ROOT}/graphql`, {
      headers,
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    const json = await resp.json();
    // check if repo exists and have info.json
    // bail if any of these fail
    if (!json.data.repoFiles) return ({ error: json.errors[0].message });
    if (!json.data.repoFiles.object.entries.length) return ({ error: 'Empty repo' });
    const files = json.data.repoFiles.object.entries;
    if (!filter(files, { name: 'info.json' }).length) return ({ error: 'No repo info.json' });

    // actual data parsing
    const result = {
      cogs: {
        valid: [],
        broken: [],
        missing: [],
      },
    };
    // get repo info
    try {
      result.repo = JSON.parse(filter(files, { name: 'info.json' })[0].object.text);
    } catch (e) {
      result.repo = { error: 'Mailformed repo info.json' };
    }
    // get cogs
    const cogs = filter(files, { type: 'tree' });
    if (!cogs.length) result.cogs.error = 'No cogs were found';
    cogs.forEach((c) => {
      if (!filter(c.object.entries, { name: 'info.json' }).length) result.cogs.missing.push(c.name);
      const cogInfoJson = filter(c.object.entries, { name: 'info.json' })[0].object.text;
      try {
        JSON.parse(cogInfoJson); // only check if ti fails
        result.cogs.valid.push(c.name);
      } catch (e) {
        result.cogs.broken.push(c.name);
      }
    });
    return result;
  } catch (e) {
    return ({ error: e.message });
  }
};
