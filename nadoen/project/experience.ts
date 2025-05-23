import { PlayerInfo } from "./types"
//ALLES HIER IS GEWOON TEMPORARY OM EEN LEVEL SYSTEEM TE TESTEN

export function addExp(player: PlayerInfo, experience: number): PlayerInfo {
    player.exp += experience
    if (player.exp >= player.requiredExp) {
        player.exp -= player.requiredExp
        player.level += 1
        player.requiredExp = Math.floor(player.requiredExp * 1.2)
    }
    return player
}

export function ExpPercentage(player: PlayerInfo): number {
    const percentage = (player.exp / player.requiredExp) * 100
    return Math.min(100, Math.floor(percentage))
}