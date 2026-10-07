import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { pool } from "../db/pool.js";
import { resetDatabase } from "../test/resetDatabase.js";

beforeEach(
  async () => {
		await resetDatabase(pool);
  },
);

afterAll(
  async () => {
    await pool.end();
  },
);

describe("AdPulse API", () => {
	it("rejects anonymous campaign access",
  	async () => {
			const response = await request(app).get("/api/campaigns");

			expect(response.status).toBe(401);

			expect(response.body).toEqual({error:"Authentication required"});
  	}	
	);

	it("registers a user and preserves the authenticated session",
  	async () => {
			const alice = request.agent(app);

			const registerResponse = await alice.post("/api/auth/register")
        .send({
					email: "alice@example.com",
					password: "StrongPassword123!",
					displayName: "Alice",
        });

			expect(registerResponse.status).toBe(201);

			expect(registerResponse.body).toMatchObject({
      	user: {
					email: "alice@example.com",
					displayName: "Alice",
				}
			})

			const meResponse = await alice.get("/api/auth/me");

			expect(meResponse.status).toBe(200);

			expect(meResponse.body).toMatchObject({
      	user: {
					email: "alice@example.com",
					displayName: "Alice",
				}
    	});
  	}
	);

	it("isolates campaigns between authenticated users",
  	async () => {
			const alice = request.agent(app);

	    const bob = request.agent(app);

	    await alice.post("/api/auth/register")
      	.send({
        	email: "alice@example.com",
					password: "StrongPassword123!",
	        displayName: "Alice"
      	})
      	.expect(201);

			await bob.post("/api/auth/register")
      	.send({
					email: "bob@example.com",
					password: "StrongPassword123!",
	        displayName: "Bob"
      	})
      	.expect(201);

			const aliceCampaign = await alice.post("/api/campaigns")
        .send({
          name: "Alice Campaign",
          budget: 5000
        })
        .expect(201);

			const bobCampaign = await bob.post("/api/campaigns")
        .send({
          name: "Bob Campaign",
          budget: 7000
        })
        .expect(201);

			const aliceList = await alice.get("/api/campaigns")
        .expect(200);

			expect(aliceList.body).toHaveLength(1);

			expect(aliceList.body[0].id).toBe(aliceCampaign.body.id);

			expect(aliceList.body.some(
        (campaign: {id: string;}) => campaign.id === bobCampaign.body.id))
					.toBe(false);

			await alice.get(`/api/campaigns/${bobCampaign.body.id}`)
      	.expect(404);

			await bob.get(`/api/campaigns/${aliceCampaign.body.id}`)
      	.expect(404);
  	}
	);

	it("does not allow one user to modify another user's campaign",
  	async () => {
			const alice = request.agent(app);

			const bob = request.agent(app);

			await alice.post("/api/auth/register")
      	.send({
        	email: "alice@example.com",
        	password: "StrongPassword123!",
        	displayName: "Alice"
      	})
      	.expect(201);

			await bob.post("/api/auth/register")
      	.send({
        	email: "bob@example.com",
        	password: "StrongPassword123!",
        	displayName: "Bob"
      	})
      	.expect(201);

			const bobCampaign = await bob.post("/api/campaigns")
        .send({
          name: "Bob Campaign",
          budget: 7000
        })
        .expect(201);

			await alice.patch(`/api/campaigns/${bobCampaign.body.id}`)
      	.send({
        	name: "Hacked by Alice"
      	})
      	.expect(404);

			const bobRead = await bob.get(`/api/campaigns/${bobCampaign.body.id}`)
        .expect(200);

    	expect(bobRead.body.name).toBe("Bob Campaign");
  	}
	);

	it("requires a creative before activating a campaign",
  	async () => {
			const alice = request.agent(app);

			await alice.post("/api/auth/register")
      	.send({
        	email: "alice@example.com",
        	password: "StrongPassword123!",
        	displayName: "Alice"
      	})
      	.expect(201);

			const campaignResponse = await alice.post("/api/campaigns")
        .send({
          name: "Launch Campaign",
          budget: 5000
        })
        .expect(201);

			const campaignId = campaignResponse.body.id;

			const rejectedActivation = await alice.patch(
          `/api/campaigns/${campaignId}/status`,
        )
        .send({
          status: "ACTIVE"
        });

			expect(rejectedActivation.status).toBe(409);

			expect(rejectedActivation.body.error).toContain(
      	"at least one creative");

			await alice.post(`/api/campaigns/${campaignId}/creatives`)
      	.send({
        	headline: "Launch Creative",
	        body: "Ready to launch",
	        destinationUrl: "https://example.com",
      })
      .expect(201);

			const activated = await alice.patch(
				`/api/campaigns/${campaignId}/status`)
        .send({
          status: "ACTIVE"
        })
        .expect(200);

			expect(activated.body.status).toBe("ACTIVE");
  	}
	);

	it("saves draft targeting and locks it after activation",
  	async () => {
	    const alice = request.agent(app);

			await alice.post("/api/auth/register")
      	.send({
        	email: "alice@example.com",
        	password: "StrongPassword123!",
        	displayName: "Alice"
      	})
      	.expect(201);

			const campaignResponse = await alice
        .post("/api/campaigns")
        .send({
          name: "Nordic Campaign",
          budget: 5000
        })
        .expect(201);

			const campaignId = campaignResponse.body.id;

	    const initialTargeting = await alice.get(
        `/api/campaigns/${campaignId}/targeting`)
        .expect(200);

			expect(initialTargeting.body).toMatchObject({
      	countries: [],
      	devices: [],
      	ageMin: null,
      	ageMax: null,
    	});

			const savedTargeting = await alice.put(
        `/api/campaigns/${campaignId}/targeting`)
        .send({
          countries: ["fi", "SE"],
          devices: ["MOBILE"],
          ageMin: 18,
	        ageMax: 40
        })
        .expect(200);

			expect(savedTargeting.body.countries).toEqual(["FI", "SE"]);


    	await alice.post(`/api/campaigns/${campaignId}/creatives`)
      	.send({
        	headline: "Nordic Creative",
					body: "Test",
					destinationUrl: "https://example.com",
      	})
      	.expect(201);

			await alice.patch(`/api/campaigns/${campaignId}/status`)
      	.send({
        	status: "ACTIVE"
      	})
      	.expect(200);

			await alice.put(`/api/campaigns/${campaignId}/targeting`)
      	.send({
        	countries: ["US"],
					devices: [],
        	ageMin: null,
        	ageMax: null,
      	})
      	.expect(409);

			const targetingAfter = await alice.get(
        `/api/campaigns/${campaignId}/targeting`)
        .expect(200);

			expect(targetingAfter.body.countries).toEqual(["FI", "SE"]);
  	}
	);

	it("rejects invalid targeting before persistence",
  	async () => {
			const alice = request.agent(app);

			await alice.post("/api/auth/register")
      	.send({
        	email: "alice@example.com",
        	password: "StrongPassword123!",
        	displayName: "Alice"
      	})
      	.expect(201);

	    const campaign = await alice.post("/api/campaigns")
        .send({
          name: "Validation Test",
          budget: 5000
        })
        .expect(201);

			await alice.put(
        `/api/campaigns/${campaign.body.id}/targeting`)
      	.send({
        	countries: ["FINLAND"],
	        devices: ["SMART_FRIDGE"],
	        ageMin: 60,
					ageMax: 20
      	})
      	.expect(400);

			const targeting = await alice.get(
        `/api/campaigns/${campaign.body.id}/targeting`,
        )
        .expect(200);

			expect(targeting.body).toMatchObject({
      	countries: [],
      	devices: [],
      	ageMin: null,
      	ageMax: null,
    	});
  	}
	);

	it("invalidates access after logout",
  	async () => {
			const alice = request.agent(app);

			await alice.post("/api/auth/register")
      	.send({
        	email: "alice@example.com",
        	password: "StrongPassword123!",
        	displayName: "Alice"
      	})
      	.expect(201);

			await alice.get("/api/campaigns").expect(200);

			await alice.post("/api/auth/logout").expect(204);

			await alice.get("/api/campaigns").expect(401);
  },
);
});