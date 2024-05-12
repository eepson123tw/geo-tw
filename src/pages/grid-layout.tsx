import React, { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import _ from "lodash";

interface GridProps {
  domElements?: unknown[];
  className?: string;
  rowHeight?: number;
  onLayoutChange?: (layout: unknown, layouts: unknown) => void;
  cols?: unknown;
  breakpoints?: unknown;
  containerPadding?: number[];
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const DropDragGrid: React.FC<GridProps> = (props) => {
  const [layouts, setLayouts] = useState<{ [index: string]: unknown[] }>({
    lg: _.map(_.range(0, 5), function (item, i) {
      return {
        x: i % 2 === 0 ? 0 : 5,
        y: i * 3,
        w: 5,
        h: 6,
        i: i.toString(),
        static: false,
      };
    }),
  });
  console.log(layouts);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
  const [compactType, setCompactType] = useState<string | null>("vertical");
  const [mounted, setMounted] = useState(false);
  const [toolbox, setToolbox] = useState<{ [index: string]: unknown[] }>({
    lg: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onBreakpointChange = (breakpoint: any) => {
    setCurrentBreakpoint(breakpoint);
    setToolbox({
      ...toolbox,
      [breakpoint]: toolbox[breakpoint] || toolbox[currentBreakpoint] || [],
    });
  };

  const onCompactTypeChange = () => {
    // eslint-disable-next-line prefer-const
    let oldCompactType = "";

    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    setCompactType(compactType);
  };

  const onLayoutChange = (layout: any, layouts: any) => {
    setLayouts({ ...layouts });
  };

  const onDrop = (layout: any, layoutItem: any, _ev: any) => {
    alert(
      `Element parameters:\n${JSON.stringify(
        layoutItem,
        ["x", "y", "w", "h"],
        2
      )}`
    );
  };

  const generateDOM = () => {
    return _.map(layouts.lg, function (l, i) {
      return (
        <div
          key={i}
          style={{ background: "#ccc" }}
          className={l.static ? "grid-static" : "grid-dynamic"}
        >
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {i}
            </span>
          ) : (
            <span className="text">{i}</span>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="grid-container">
        <ResponsiveReactGridLayout
          {...props}
          style={{ background: "#f0f0f0" }}
          layouts={layouts}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          compactType={compactType}
          preventCollision={!compactType}
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange}
          onDrop={onDrop}
          isDroppable
        >
          {generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    </>
  );
};

export default DropDragGrid;
