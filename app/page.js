import Journey from "./Journey";
import { CONSENT, DOWNLOADS, EVENT, INTERESTS, PRIZE, touchpointKey } from "@/lib/config";

export default function Page({ searchParams }) {
  return (
    <Journey
      src={touchpointKey(searchParams?.src)}
      event={EVENT}
      prize={PRIZE}
      interests={INTERESTS.map(({ key, label, hot }) => ({ key, label, hot }))}
      consent={CONSENT.text}
      downloads={DOWNLOADS}
    />
  );
}
