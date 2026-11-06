export interface SampleTranscript {
  id: string;
  title: string;
  meetingDate: string;
  category: string;
  description: string;
  content: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    id: 'q4-product-sprint',
    title: 'Q4 Product Roadmap & Sprint Planning',
    meetingDate: '2026-11-04',
    category: 'Product & Engineering',
    description: 'Sprint planning with concrete feature deadlines, one ambiguous analytics owner, and a database decision.',
    content: `[00:00] Maya (VP Product): Good morning team. Let's align on Q4 deliverables. Our top priority is getting the new Team Spaces feature shipped before the Thanksgiving break.
[00:45] David (Tech Lead): On the backend, we completed the schema migrations yesterday. We agreed on using PostgreSQL with read-replicas for Team Spaces instead of Mongo, which eliminates our concurrency bottleneck.
[01:30] Maya: Great, so that decision is locked in. Let's record that: we are standardizing on PostgreSQL with read replicas for all Team Spaces data.
[02:10] Sarah (Frontend Lead): From the UI side, the team spaces dashboard components are 80% ready. I will finish the permissions management modal and hook up the role-based toggles by Friday, November 13th at 5 PM.
[03:00] David: Excellent. For the real-time presence indicators, David will implement the WebSocket reconnection fallback by next Tuesday, November 10th.
[03:45] Maya: What about the usage analytics dashboard? The board requested weekly active user metrics broken down by space. Someone really needs to build the telemetry pipeline for this soon.
[04:20] David: Yeah, that's crucial, but neither my team nor Sarah's team officially owns analytics instrumentation right now. We need someone to step up or hire a contractor.
[04:55] Maya: Okay, let's flag that. We need to decide who owns the telemetry pipeline and have an initial dashboard mockup ready ASAP.
[05:30] Marcus (QA & Security): On security, all API endpoints for Team Spaces need an automated penetration test. Marcus will run the OWASP security audit script and submit the compliance report by November 18th.
[06:15] Sarah: One question Marcus: do we need VP sign-off before deploying the test suite to staging?
[06:35] Maya: Yes, I will review and provide formal sign-off once Marcus submits the report. Let's schedule a 30-minute follow-up review on November 19th with Maya, Marcus, and David.
[07:10] Maya: Thanks everyone. Let's wrap up.`
  },
  {
    id: 'cloud-infra-incident',
    title: 'Cloud Infrastructure & Incident Retrospective',
    meetingDate: '2026-11-05',
    category: 'Engineering & DevOps',
    description: 'Post-mortem with critical infrastructure fixes, ambiguous on-call rotation ownership, and a failover deadline.',
    content: `[00:00] Alex (Director of DevOps): Welcome to the post-mortem for Wednesday's 42-minute Redis cluster outage. Let's review the root cause and lock down preventive actions.
[00:40] Priya (Senior SRE): The primary cause was memory exhaustion on redis-node-02 caused by un-evicted session keys during the marketing blitz. The cluster didn't failover automatically because the sentinel quorum was misconfigured to 3 when only 2 sentinels were active.
[01:35] Alex: That is a critical finding. Decision: We are upgrading the Redis cluster to managed AWS ElastiCache with multi-AZ automatic failover enabled. We won't maintain self-hosted Sentinels anymore.
[02:20] Priya: I agree completely. Priya will provision the new AWS ElastiCache cluster and execute the zero-downtime data migration by Friday, November 14th at 4:00 PM EST.
[03:05] Kevin (Backend Lead): I will audit the session service codebase to ensure all keys have strict TTL values set. Kevin will merge the PR by Wednesday, November 11th.
[03:50] Alex: What about the monitoring alert delays? PagerDuty took 18 minutes to notify the primary on-call engineer because the latency threshold was set to 5000ms.
[04:30] Priya: We definitely need to revamp our Datadog alert thresholds and test the escalation matrix. It would be great if someone looked into fine-tuning the threshold down to 500ms.
[05:00] Kevin: Should that be DevOps or application team? And when does it need to be done?
[05:20] Alex: That's ambiguous. Let's make sure someone takes responsibility for the alert tuning before our next big promotional event.
[05:50] Kevin: Also, we should communicate with customer support about the outage credits for affected Enterprise tier customers.
[06:25] Alex: Good call. Alex will draft the customer incident summary and send it to the CS team by tomorrow noon, November 6th.
[07:00] Priya: Perfect. Let's also do a follow-up dry run of automated failover in two weeks.`
  },
  {
    id: 'client-kickoff',
    title: 'Enterprise Client Onboarding & Scope Alignment',
    meetingDate: '2026-11-03',
    category: 'Client Services',
    description: 'External client onboarding with custom SSO setup, missing data migration deadline, and contract scope boundaries.',
    content: `[00:00] Rachel (Engagement Manager): Thank you everyone for joining the Acme Corp enterprise onboarding kickoff. Today we want to finalize milestones for Phase 1.
[00:50] Carlos (Client IT Director - Acme): Hi Rachel. Our main priority is Okta SAML Single Sign-On integration. Our infosec policy requires SSO before any of our 2,500 employees can access the platform.
[01:45] Rachel: Understood. Decision: Phase 1 launch will strictly gate user provisioning behind Okta SAML 2.0 with SCIM protocol support. We will not support local username/password logins for Acme.
[02:30] Liam (Integration Engineer): Liam will deliver the SAML metadata XML and configure the sandbox testing environment by Thursday, November 12th.
[03:15] Carlos: That works for our IT team. Next topic: historical data migration. We have about 140,000 legacy records in CSV format that need to be ingested into your system.
[04:00] Rachel: We can handle that. Liam's team has an ETL script. But Carlos, who on your side is responsible for cleaning and validating the CSV exports before handing them over?
[04:45] Carlos: Hmm, probably either Lisa or our database administrator Greg. I'll need to check who has bandwidth. Let's just say Acme team will provide the validated dataset sometime next week.
[05:30] Rachel: We'll need a specific date and point of contact because our ETL batch window requires a 48-hour reservation. Let's clarify that as soon as possible.
[06:10] Liam: Also, do the legacy records include custom tags? That wasn't specified in the original SOW.
[06:35] Rachel: Let's treat custom tags as an open clarification question. If custom schemas are needed, it may require a Change Order.
[07:15] Rachel: Rachel will send the Master Service Agreement Addendum and sandbox credentials by November 9th. Next check-in is scheduled for November 16th.`
  }
];
