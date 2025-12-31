import { MinHeap } from "./MinHeap";

export class ColorAllocator {
    private availableColors = new MinHeap();
    private assigned = new Map<number, number>(); // personID to priority
    private priorityToColor = new Map<number, string>();    // priority to color

    constructor() {
        const colors = ["#F06543", "#FFA500", "#6F8F4E", "#3E7C7B", "#2F3A56"];
        colors.forEach((_, index) => {
            this.availableColors.push(index)
            this.priorityToColor.set(index, colors[index]);
        });
    }

    assign(personID: number): string {
        if (this.assigned.has(personID)) {
            return this.priorityToColor.get(this.assigned.get(personID)!)!;
        }
        if (this.availableColors.isEmpty()) {
            throw new Error("No available colors to assign");
        }

        const priority = this.availableColors.pop()!;
        this.assigned.set(personID, priority);
        return this.priorityToColor.get(priority)!;
    }

    release(personID: number) {
        const priority = this.assigned.get(personID);
        if (priority === undefined) return;

        this.assigned.delete(personID);
        this.availableColors.push(priority);
    }

    getAssignedColors(): Map<number, string> {
        const result = new Map<number, string>();
        this.assigned.forEach((priority, personID) => {
            const color = this.priorityToColor.get(priority)!;
            result.set(personID, color);
        });
        console.log("Assigned Colors:", result);
        return result;
    }
}