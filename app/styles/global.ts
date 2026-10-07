import { css } from "hono/css";

const rules = {
  font: css`
    @font-face {
      font-family: 'Pretendard VF Distilled';
      src: url('https://cdn.jsdelivr.net/gh/parksb/cdn@master/font/Pretendard/woff2/Pretendard-VF-Distilled.woff2')
        format('woff2');
      font-display: swap;
    }
  `,

  theme: css`
    html {
      min-height: 100%;
      --page-top: 32px;
      --navigation-height: 40px;
      --sidebar-width: 180px;
      --sidebar-row-height: 28px;
      --column-gap: clamp(24px, 5vw, 64px);
      --document-gap: 12px;
      --bg: #fdfdfc;
      --text: #24292e;
      --text-secondary: #6a737d;
      --border: #dfe2e5;
      --border-secondary: #eaecef;
      --link: #0366d6;
      --link-secondary: #53a6f6;
      --link-external: #00a0c0;
      --link-external-secondary: #50b0d0;
      --link-not-found: #ff4070;
      --code-bg: #f6f8fa;
      --block-info-border: #90d0ef;
      --block-note-bg: #fffce7;
      --block-note-border: #efdf9f;
      --block-note-text: #a08040;
    }
  `,

  page: css`
    body {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: var(--column-gap);
      box-sizing: border-box;
      max-width: 980px;
      margin: 0 auto;
      padding: var(--page-top) 48px;
      word-break: keep-all;
      word-wrap: break-word;
      line-height: 1.6;
      font-family: 'Pretendard VF Distilled', sans-serif;
      font-size: 16px;
      font-weight: 400;
      min-height: 100vh;
      width: 100%;
      background-color: var(--bg);
      -webkit-font-smoothing: antialiased;
    }
  `,

  links: css`
    a {
      color: var(--link);
      text-decoration: none;
    }

    a[href$="http-404"] {
      color: var(--link-not-found);
    }

    a.external {
      color: var(--link-external);
    }

    a.external:after {
      content: '↗';
      font-size: .7rem;
      vertical-align: super;
    }

    a:hover {
      outline-width: 0;
      text-decoration: underline;
    }
  `,

  smallText: css`
    small {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: normal;
    }
  `,

  homeLinks: css`
    a:is([href="/simonpedia"], [href="/simonpedia.html"], [href="simonpedia.html"])::before {
      content: '';
      display: inline-block;
      background: url('/assets/logo.svg') center / contain no-repeat;
    }

    a:is([href="/simonpedia"], [href="/simonpedia.html"], [href="simonpedia.html"])::before {
      width: 1em;
      height: 1em;
      vertical-align: -0.1em;
    }
  `,
} satisfies Record<string, ReturnType<typeof css>>;

export const defaultStyles = css`${Object.values(rules)}`;
