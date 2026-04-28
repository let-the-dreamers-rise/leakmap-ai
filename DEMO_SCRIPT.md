# LeakMap AI — 3-Minute Demo Video Script

**Target Time:** 3:00 (approx. 400-450 words spoken at normal pace)
**Theme:** Google Solution Challenge 2026 — Digital Media Protection
**Vibe:** Professional, intense, enterprise-grade (think Palantir or Bloomberg Terminal)

---

## 0:00 - 0:30 | The Hook & Problem (30 sec)
**[Visual]**
*Start with a title card: "LeakMap AI: Digital Media Protection". Cut to a fast montage of sports highlights being illegally streamed on Reddit, Telegram, and TikTok.*

**[Speaker]**
"In the modern sports broadcasting era, live media rights are worth billions. But the moment an exclusive highlight hits the broadcast feed, it's ripped, remixed, and redistributed across the internet in seconds. For Trust & Safety analysts and rights operations teams, tracking these leaks manually across fragmented platforms is impossible. 

Welcome to LeakMap AI—an enterprise-grade, cloud-native control plane built to protect digital media integrity at internet scale."

## 0:30 - 1:15 | The Sovereign Terminal & Ingestion (45 sec)
**[Visual]**
*Screen recording of the LeakMap AI app loading. The user is on the 'Overview' tab. Zoom in on the command header and the 'Case Intake' rail.*

**[Speaker]**
"What you're looking at is the Sovereign Terminal—a high-density operator workspace designed for speed. 

LeakMap AI is deployed fully on Google Cloud Run for elastic scalability. When an official asset like a 'Continental Cup Equalizer' clip is registered, we hash it and store the reference in Cloud Storage. 

When we click **Run Scan**, we trigger an asynchronous ingestion pipeline powered by Google Cloud Pub/Sub. The system searches across platforms—Telegram, TikTok, Reddit—matching perceptual signatures and recovering hidden watermarks."

*Click the "Run scan" button. Show the UI update.*

## 1:15 - 1:55 | Threat Intelligence & Data Density (40 sec)
**[Visual]**
*Click on the "Threats (5)" tab. Slowly scroll through the table. Click on the "StadiumLeaksHD" row to update the right inspector panel.*

**[Speaker]**
"Let's look at the Threats view. We've detected 5 suspects. 

Instead of overwhelming the analyst, LeakMap AI calculates a **Composite Risk Score** for each threat. This score combines cryptographic fingerprinting, watermark recovery rates, and AI-alteration detection. 

Selecting a high-risk threat updates the Inspector Panel instantly. We can see exactly where the leak happened, its velocity, and the modifications made by the pirate—like AI voiceovers or cropping to avoid basic hash-matching."

## 1:55 - 2:30 | Attribution & AI Enforcement (35 sec)
**[Visual]**
*Click on the "Propagation" tab showing the chain. Then, click the "Draft takedown notice" button in the right inspector. The modal pops up with the Gemini-generated text.*

**[Speaker]**
"But finding the leak isn't enough; we need to know how it spread. The **Propagation Chain** visualizes the attribution flow—identifying exactly which broadcast partner or distribution relay the leak originated from. All this propagation data is streamed into BigQuery for long-term analytics.

When it's time to act, we rely on **Gemini 2.5 Flash**. With a single click, Gemini synthesizes the case metadata, threat intelligence, and legal guardrails to generate a fully formatted, legally sound DMCA Takedown Notice, ready for immediate dispatch."

## 2:30 - 3:00 | Conclusion & Scale (30 sec)
**[Visual]**
*Click the "Export" button to show the JSON report downloading. Zoom out to show the full 3-column desktop layout, then quickly resize the browser window down to mobile width to show the 5-tab responsive view.*

**[Speaker]**
"Everything the analyst needs is exportable as a cryptographic evidence bundle. And because analysts need to respond to critical alerts on the go, the entire terminal collapses seamlessly into a mobile-native tabbed interface.

LeakMap AI isn't just a prototype. Backed by the power of Google Cloud and Gemini, it's a production-ready media integrity platform built to protect the future of digital sports. Thank you."

---

## Filming Checklist
- [ ] Set browser to full screen (F11) to hide tabs/bookmarks.
- [ ] Ensure `.env.local` has `GEMINI_API_KEY` set so the takedown generation is live.
- [ ] Practice the "Run scan" timing to align with the script.
- [ ] Record the browser resize smoothly to demonstrate the mobile layout.
