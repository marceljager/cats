Tools that make files for the repo by hand, when their source changes (unlike scripts/, which
runs on every build). Each says at its top what it writes.

  npm run og      public/og.png, the picture a shared link shows (drawn in headless Google Chrome;
                  CHROME points at another Chrome than the one in /Applications)
  npm run icons   public/apple-touch-icon.png, from public/favicon.svg
