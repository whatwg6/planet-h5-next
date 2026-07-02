import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

export type TreeNode = {
  id: string;
  label: string;
  disabled?: boolean;
  children?: TreeNode[];
};

type TreeProps = {
  nodes: TreeNode[];
  defaultExpandedIds?: string[];
  selectedId?: string;
  empty?: ReactNode;
  onSelect?: (node: TreeNode) => void;
  className?: string;
};

export function Tree({
  nodes,
  defaultExpandedIds = [],
  selectedId,
  empty = "暂无数据",
  onSelect,
  className,
}: TreeProps) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(defaultExpandedIds));

  const renderedNodes = useMemo(
    () =>
      nodes.map((node) => (
        <TreeNodeRow
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onSelect={onSelect}
          onToggle={(nodeId) => {
            setExpandedIds((current) => {
              const next = new Set(current);
              if (next.has(nodeId)) {
                next.delete(nodeId);
              } else {
                next.add(nodeId);
              }
              return next;
            });
          }}
        />
      )),
    [expandedIds, nodes, onSelect, selectedId],
  );

  if (nodes.length === 0) {
    return (
      <div className={cn("px-3 py-6 text-center text-sm text-text-tertiary", className)}>
        {empty}
      </div>
    );
  }

  return (
    <div role="tree" className={cn("divide-y divide-border-solid-line-2", className)}>
      {renderedNodes}
    </div>
  );
}

function TreeNodeRow({
  node,
  depth,
  expandedIds,
  selectedId,
  onSelect,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  onToggle: (nodeId: string) => void;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const expanded = hasChildren && expandedIds.has(node.id);
  const selected = selectedId === node.id;

  return (
    <div>
      <div
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={selected || undefined}
        className={cn(
          "flex min-h-12 items-center gap-2 px-3 py-2 text-sm text-text-primary",
          selected && "bg-functional-brand-transparent text-functional-brand-foreground",
          node.disabled && "opacity-50",
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-tertiary active:bg-background-primary-container--active"
            aria-label={`${expanded ? "收起" : "展开"} ${node.label}`}
            onClick={() => onToggle(node.id)}
          >
            <span aria-hidden className={cn("transition-transform", expanded && "rotate-90")}>
              ›
            </span>
          </button>
        ) : (
          <span className="h-8 w-8 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          className="min-w-0 flex-1 truncate rounded-md py-2 text-left disabled:cursor-default"
          disabled={node.disabled || !onSelect}
          onClick={() => onSelect?.(node)}
        >
          {node.label}
        </button>
      </div>
      {expanded
        ? children.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))
        : null}
    </div>
  );
}
