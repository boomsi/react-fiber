// 当前处理到的 fiber 和根 fiber
let nextFiberReconcileWork = null;
let wipRoot = null;

function workloop(deadline) {
  // 有空闲时间 且 存在下一个 fiber，执行下一个vdom转fiber的 reconcile
  let shouldYield = false;
  while (nextFiberReconcileWork && !shouldYield) {
    nextFiberReconcileWork = performNextWork(nextFiberReconcileWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextFiberReconcileWork) {
    commitRoot();
  }

  // do xxx
  requestIdleCallback(workloop);
}
requestIdleCallback(workloop);



function performNextWork(fiber) {
  reconcile(fiber);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}
