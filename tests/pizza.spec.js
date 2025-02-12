import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
    await page.route('*/**/api/order', async (route) => {
      const orderReq = {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
      };
      const orderRes = {
        order: {
          items: [
            { menuId: 1, description: 'Veggie', price: 0.0038 },
            { menuId: 2, description: 'Pepperoni', price: 0.0042 },
          ],
          storeId: '4',
          franchiseId: 2,
          id: 23,
        },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    });
  
    await page.goto('/');
  
    // Go to order page
    await page.getByRole('button', { name: 'Order now' }).click();
  
    // Create order
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();
  
    // Login
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // Pay
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();
  
    // Check balance
    await expect(page.getByText('0.008')).toBeVisible();
  });

  test('sign in as franchise owner, create and delete store', async ({ page }) => {

    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'f@jwt.com', password: 'franchisee' };
        const loginRes = {
            "user": {
              "id": 3,
              "name": "pizza franchisee",
              "email": "f@jwt.com",
              "roles": [
                {
                  "objectId": 1,
                  "role": "franchisee"
                }
              ]
            },
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibmFtZSI6InBpenphIGZyYW5jaGlzZWUiLCJlbWFpbCI6ImZAand0LmNvbSIsInJvbGVzIjpbeyJvYmplY3RJZCI6MSwicm9sZSI6ImZyYW5jaGlzZWUifV0sImlhdCI6MTczOTMzMDU3OX0.310xUJnUKf2s88bkEi5LYn7QJRHOHcr-rc1e8_lcIlY"
          };
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
      });

      await page.route('*/**/api/franchise/3', async (route) => {
        const franchiseRes = [
            {
              "id": 1,
              "name": "pizzaPocket",
              "admins": [
                {
                  "id": 3,
                  "name": "pizza franchisee",
                  "email": "f@jwt.com"
                }
              ],
              "stores": [ ]
            }
          ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
      });

      await page.route('*/**/api/franchise/1/store', async (route) => {
        const franchiseReq = { "id": "", "name": "Spokane" };
        const franchiseRes = {
            "id": 27,
            "franchiseId": 1,
            "name": "Spokane"
          };
          expect(route.request().method()).toBe('POST');
          expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
          await route.fulfill({ json: franchiseRes });
      });

      await page.route('*/**/api/franchise/1/store/27', async (route) => {
        const franchiseRes = { "message": "store deleted" };
        expect(route.request().method()).toBe('DELETE');
        await route.fulfill({ json: franchiseRes });
      });



      await page.route('*/**/api/franchise/3', async (route) => {
        const franchiseRes = [
            {
              "id": 1,
              "name": "pizzaPocket",
              "admins": [
                {
                  "id": 3,
                  "name": "pizza franchisee",
                  "email": "f@jwt.com"
                }
              ],
              "stores": [
                {
                  "id": 27,
                  "name": "Spokane",
                  "totalRevenue": 0
                }
              ]
            }
          ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
      });




    await page.goto('http://localhost:5173/');

    //login as franchisee
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('link', { name: 'login', exact: true }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();

    //create store
    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('Spokane');
    await page.getByRole('textbox', { name: 'store name' }).press('Enter');
    await page.getByRole('button', { name: 'Create' }).click();

    //delete store
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('row', { name: 'Spokane 0 ₿ Close' }).getByRole('button').click();
    await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('register new diner, navagate pages', async ({ page }) => {

    await page.route('*/**/api/auth', async (route) => {
        if (route.request().method() === 'POST') {
          const registerReq = { "name": "Luke Grundvig", "email": "d@jwt.com", "password": "d" };
          const registerRes = {
            "user": {
              "name": "Luke Grundvig",
              "email": "d@jwt.com",
              "roles": [
                {
                  "role": "diner"
                }
              ],
              "id": 152
            },
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTHVrZSBHcnVuZHZpZyIsImVtYWlsIjoiZEBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJkaW5lciJ9XSwiaWQiOjE1MiwiaWF0IjoxNzM5MzMzMzQ0fQ.G2FhDSR9UrSXmU99BoZsPqgD30IttG0BR4xq-rE-jUQ"
          };
          expect(route.request().postDataJSON()).toMatchObject(registerReq);
          await route.fulfill({ json: registerRes });
        }
      });

      await page.route('*/**/api/franchise/152', async (route) => {
        const franchiseRes = [];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
      });

      await page.route('*/**/api/order', async (route) => {
        const franchiseRes = {
            "dinerId": 152,
            "orders": [],
            "page": 1
          };
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
      });

      await page.route('*/**/api/auth', async (route) => {
        if (route.request().method() === 'DELETE') {
            const logoutRes = { "message": "logout successful" };
            await route.fulfill({ json: logoutRes });
        }
      });

    await page.goto('http://localhost:5173/');

    //register new diner
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('Luke Grundvig');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('d');
    await page.getByRole('button', { name: 'Register' }).click();

    //navagate to pages
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
    await expect(page.getByRole('main')).toContainText('It all started in Mama Ricci\'s kitchen. She would delight all of the cousins with a hot pie in any style they could think of Milanese, Chicago deep dish, Detroit square pan, Neapolitan, or even fusion flatbread.Pizza has a long and rich history that dates back thousands of years. Its origins can be traced back to ancient civilizations such as the Egyptians, Greeks, and Romans. The ancient Egyptians were known to bake flatbreads topped with various ingredients, similar to modern-day pizza. In ancient Greece, they had a dish called "plakous" which consisted of flatbread topped with olive oil, herbs, and cheese.However, it was the Romans who truly popularized pizza-like dishes. They would top their flatbreads with various ingredients such as cheese, honey, and bay leaves.Fast forward to the 18th century in Naples, Italy, where the modern pizza as we know it today was born. Neapolitan pizza was typically topped with tomatoes, mozzarella cheese, and basil. It quickly became a favorite among the working class due to its affordability and delicious taste. In the late 19th century, pizza made its way to the United States through Italian immigrants.It gained popularity in cities like New York and Chicago, where pizzerias started popping up. Today, pizza is enjoyed worldwide and comes in countless variations and flavors. However, the classic Neapolitan pizza is still a favorite among many pizza enthusiasts. This is especially true if it comes from JWT Pizza!');
    await page.getByRole('link', { name: 'About' }).click();
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
  });

  test('login as admin, open and close a franchise', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('pizzapizza');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('row', { name: 'pizzapizza 常用名字 Close' }).getByRole('button').click();
    await page.getByRole('button', { name: 'Close' }).click();
  });