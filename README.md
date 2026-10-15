
# Atelier

Atelier is a web project built around two distinct digital experiences: luxury and space. Each has its own visual identity, motion design and interactive elements, with a shared Next.js codebase and a dedicated admin interface.

## Atelier Lux

A luxury-focused experience inspired by high-end jewellery, editorial photography and contemporary design. The interface combines cinematic media, refined typography, gold accents, scroll-driven transitions and interactive 3D objects.

## Atelier Nova

A space-themed experience focused on Earth, satellites and orbital exploration. It uses immersive visuals, 3D models, motion and scroll-based storytelling to create a more cinematic way of exploring the page.

## Admin

The project includes a separate admin interface for working with the website's content and visual settings, including supported media and external 3D model sources.

## Built With

- Next.js and React
- TypeScript
- Three.js for 3D graphics
- Swiper for sliders and interactive presentations
- CSS animations and custom motion effects

## Project Structure

- `/luxury` — Luxury experience
- `/space` — Space experience
- `/admin` — Admin interface

The three sections share one codebase while serving different purposes.

## Deployment

Deploy this project once as a single Next.js site. Keep the routes on the same origin:

- `/admin` — private browser-local content editor
- `/luxury` — Luxury experience
- `/space` — Space experience

Do not set a `DEPLOY_SITE` host-switching variable. The editor uses browser-local storage, which is isolated by origin; keeping these routes under one origin lets the same browser profile use its saved customizations on both experiences.

---

© 2026 Goutam Kathuria. All rights reserved.

See [LICENSE](./LICENSE) for usage restrictions.


## Selected cinematic video sources

The default film slots use direct MP4 files from Pexels (free-use clips) instead of HTML video-page URLs:

- Luxury hero — [Golden Jewelry Close-up](https://www.pexels.com/video/golden-jewelry-close-up-5815082/) by Videogrammer.com.
- Luxury film section — [Close-up Jewelry Making](https://www.pexels.com/video/close-up-jewelry-making-6263491/) by Tima Miroshnichenko.
- Space film section — [Cinematic View of Earth from Space](https://www.pexels.com/video/cinematic-view-of-earth-from-space-33453196/) by Adis Resic.

Pexels labels each clip Free on its source page. These are remote video sources, so playback still depends on the Pexels CDN being reachable by the visitor's browser. The image URLs in the content config act as visual fallbacks while each background video initializes.
