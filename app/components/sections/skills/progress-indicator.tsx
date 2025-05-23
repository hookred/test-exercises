import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import { type ChartConfig, ChartContainer } from "#app/components/ui/chart"
const chartData = [
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--color-foreground))",
  },
} satisfies ChartConfig

export function SkillProgressIndicator({ progress }: { progress?: number }) {
  const advancement = progress ? progress : 0
  return (
    <div className="flex flex-col">
      <div className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 - 360 * advancement / 100}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                          dy="4"
                        >
                          {advancement.toLocaleString()}%
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col gap-2 text-sm text-center">
        <div className="flex justify-center gap-2 font-medium leading-none">
          Your mastering of this skill
        </div>
        {/* <div className="leading-none text-muted-foreground">
        </div> */}
      </div>
    </div>
  )
}
