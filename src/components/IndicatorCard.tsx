import { type IconNode, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import type { Icon } from "@tabler/icons-react";

type tProps = {
	icon: LucideIcon;
	value: number | string;
	description: string;
	color: string;
};
export default function IndicatorCard({ icon: Icon, value, description, color }: tProps) {
	var backgroundColor;
	var borderColor;
	var textColor;
	var iconColor;

	switch (color) {
		case "red":
			backgroundColor = "bg-red-50";
			borderColor = "border-red-200";
			textColor = "text-red-800";
			iconColor = "#dc2626";
			break;
		case "green":
			backgroundColor = "bg-green-50";
			borderColor = "border-green-200";
			textColor = "text-green-800";
			iconColor = "#16a34a";
			break;
		case "blue":
			backgroundColor = "bg-blue-50";
			borderColor = "border-blue-200";
			textColor = "text-blue-800";
			iconColor = "#2563eb";
			break;
		case "yellow":
			backgroundColor = "bg-yellow-50";
			borderColor = "border-yellow-200";
			textColor = "text-yellow-800";
			iconColor = "#ca8a04";
			break;
		case "purple":
			backgroundColor = "bg-purple-50";
			borderColor = "border-purple-200";
			textColor = "text-purple-800";
			iconColor = "#9333ea";
			break;
		case "orange":
			backgroundColor = "bg-orange-50";
			borderColor = "border-orange-200";
			textColor = "text-orange-800";
			iconColor = "#ea580c";
			break;

		default:
			break;
	}
	return (
		<Card className={`relative grow p-6 rounded-xl ${textColor} border ${backgroundColor} ${borderColor} hover:shadow-lg transition-all duration-200 group`}>
			<CardHeader className="p-0 mb-4 flex items-start justify-between">
				<div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
					<Icon color={iconColor} />
				</div>
				<div className="text-right">
					<div className={`text-3xl font-bold mb-1`}>{value}</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className={`text-sm font-medium opacity-90`}>{description}</div>
			</CardContent>

			<div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
		</Card>
	);
}
