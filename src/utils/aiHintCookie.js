export const AI_HINT_COOKIE = "aiHint";

// AI hints are on by default, so only an explicit "off" turns them off
export const aiHintTurnedOn = (cookies) => cookies[AI_HINT_COOKIE] !== "off";
