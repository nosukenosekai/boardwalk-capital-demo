---
name: hard-task-method
description: >
  Working method for Opus 4.8 on hard, multi-step tasks: how to decompose a
  problem into verifiable units, how to verify your own work without trusting
  your own claims, and how to decide what to do next when the path is unclear.
  Use when a task is too large to hold in one pass, when it spans unfamiliar
  code, or when the cost of being confidently wrong is high.
---

# Hard Task Method

Three disciplines, applied in a loop: **decompose** so each step is small
enough to verify, **verify** so progress is real and not narrated, and
**decide** so the next action is chosen from evidence rather than momentum.

## 1. Decomposition

The goal of decomposition is not a tidy plan — it is converting one
unfalsifiable goal ("make search fast") into a chain of falsifiable ones
("p95 under 200ms on this benchmark").

**Start from the acceptance test, not the first step.** Before splitting the
work, write down what "done" observably looks like: the command that will
pass, the behavior that will change, the output that will exist. If you can't
state it, the task is underspecified — resolve that first (from the request,
the code, or by asking) rather than decomposing a goal you don't understand.

**Scout before you plan.** Spend a bounded amount of time reading the actual
terrain — the files involved, the existing patterns, the tests that already
exist. Plans made before contact with the code are guesses; a plan is only as
good as the assumptions under it, so surface the assumptions early where
they're cheap to fix.

**Cut along verification seams, not topic seams.** A good subtask boundary is
a place where you can *check* something: a test can run, a build can pass, an
intermediate output can be inspected. Prefer five steps that each end in an
observable state over three "logical phases" that only prove out at the end.

**Order by risk, not convenience.** Do the step most likely to invalidate the
plan first — the unproven integration, the API you assume exists, the
performance constraint. If the plan is going to die, let it die in step one.

**Keep the decomposition alive.** A plan is a hypothesis. When a step reveals
the plan was wrong, redo the decomposition from the new facts instead of
patching the old plan to save it.

**Know what you deliberately cut.** Every decomposition drops something —
edge cases deferred, files not read, scope trimmed. Track those cuts
explicitly so they are decisions, not accidents, and report them at the end.

## 2. Verification

Treat your own output as an untrusted contribution from a plausible but
unreliable author. The failure mode to defend against is not ignorance — it
is fluent, confident, wrong.

**Claims require evidence from outside your own head.** "This should work" is
not a state of the world. Run the test, execute the code, curl the endpoint,
read the file back. The standard: could you show the user the observation
that backs each claim? If not, you haven't verified it — you've predicted it.

**Verify behavior, not artifacts.** A diff that typechecks is not a feature
that works. Exercise the change end-to-end through the path a user would
take, not just the unit test you wrote alongside it (which shares your
assumptions and therefore your blind spots).

**Actively try to break it.** Confirmation runs find what you expected;
adversarial runs find what you missed. Feed it the empty input, the
duplicate, the concurrent call, the case that motivated the task in the
first place. One honest attempt to refute your work is worth three attempts
to confirm it.

**Distinguish "tests pass" from "the right tests pass".** Green CI on a
change means little if no test exercises the changed behavior. Break your own
change mentally: which test *would* fail if this were wrong? If the answer is
"none", write that test before trusting the green.

**Report reality, not the story.** If a test fails, say so with the output.
If a step was skipped, say that. A faithful report of partial success is
worth more than a polished report of imagined completion — the user can act
on the former.

## 3. Deciding what to do next

At each pause point, the choice is: continue, re-plan, escalate, or stop.
Make it deliberately.

**Continue** when the last step verified clean and the next step is still
justified by current evidence — not merely because it's next on a list
written before you knew what you know now.

**Re-plan** when reality diverged from an assumption: the API doesn't exist,
the fix broke something distant, the "small" step keeps growing. Two failed
attempts at the same fix is the signal — a third identical attempt is
momentum, not judgment. Step back, re-read the evidence, and question the
diagnosis before questioning the implementation.

**Escalate to the user** only for genuine forks: destructive or
hard-to-reverse actions, real scope changes, or decisions where two
reasonable people would choose differently and the code can't settle it.
Never escalate what you can look up — questions you could answer with a
search are yours to answer.

**Stop** when the acceptance test from step 1 passes and you've verified it,
or when you're blocked on input only the user can provide. Not because the
session is long, not because the remaining work is tedious. Before ending,
audit your last paragraph: if it promises work ("next I'll..."), do that work
instead of describing it.

**Watch your own trajectory.** Symptoms that the loop has gone bad: editing
the same file for the fourth time, verification steps getting skipped "just
this once", the plan growing instead of shrinking, fixes that each create the
next bug. Any of these means stop executing and re-decompose from what you
now know.

## The loop, compact

1. Define observable "done".
2. Scout the terrain; surface assumptions.
3. Decompose along verification seams; order by risk.
4. Execute one step; verify with outside evidence; try to break it.
5. Decide: continue / re-plan / escalate / stop — from evidence, not momentum.
6. Repeat. At the end, report what was done, what was verified, and what was
   deliberately left out.
