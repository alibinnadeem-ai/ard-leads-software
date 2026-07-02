import './globals.css'

export const metadata = {
  title: 'ARD Developers - Event Platform',
  description: 'Lead capture, brochure delivery, and Lucky Draw platform for ARD Developers events.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `.ard-scroll-resetting body{visibility:hidden}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (window.location.pathname !== '/') return;

                document.documentElement.classList.add('ard-scroll-resetting');

                function resetTop() {
                  window.scrollTo(0, 0);
                }

                function revealTop() {
                  resetTop();
                  document.documentElement.classList.remove('ard-scroll-resetting');
                }

                if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
                resetTop();

                window.addEventListener('pageshow', function () {
                  resetTop();
                  requestAnimationFrame(revealTop);
                });
                window.addEventListener('pagehide', resetTop);
                window.addEventListener('beforeunload', resetTop);
                window.addEventListener('load', revealTop);
                document.addEventListener('DOMContentLoaded', function () {
                  resetTop();
                  requestAnimationFrame(revealTop);
                });

                requestAnimationFrame(function () {
                  resetTop();
                  requestAnimationFrame(revealTop);
                });
                setTimeout(revealTop, 250);
                setTimeout(resetTop, 750);
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
