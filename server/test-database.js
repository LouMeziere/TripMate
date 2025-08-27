const { Trip, Category, sequelize } = require('./models');

async function testDatabaseOperations() {
  try {
    console.log('🧪 Starting database operations test...\n');

    // Test 1: Create a test category
    console.log('1️⃣ Creating test category...');
    const testCategory = await Category.create({
      value: 'test_restaurants',
      label: 'Test Restaurants', 
      description: 'Test category for dining',
      icon: '🍽️',
      color: 'bg-red-100 text-red-800',
      isActive: true,
      sortOrder: 1
    });
    console.log('✅ Category created:', testCategory.toJSON());

    // Test 2: Create a test trip
    console.log('\n2️⃣ Creating test trip...');
    const testTrip = await Trip.create({
      title: 'Test Trip to Paris',
      destination: 'Paris, France',
      startDate: '2025-09-01',
      endDate: '2025-09-07',
      travelers: 2,
      budget: 'medium',
      pace: 'moderate',
      status: 'draft',
      itinerary: [
        { day: 1, activity: 'Visit Eiffel Tower' },
        { day: 2, activity: 'Louvre Museum' }
      ]
    });
    console.log('✅ Trip created:', testTrip.toJSON());

    // Test 3: Associate trip with category
    console.log('\n3️⃣ Associating trip with category...');
    await testTrip.addCategories([testCategory]);
    console.log('✅ Association created');

    // Test 4: Query trip with categories
    console.log('\n4️⃣ Querying trip with categories...');
    const tripWithCategories = await Trip.findByPk(testTrip.id, {
      include: [{ model: Category, as: 'categories' }]
    });
    console.log('✅ Trip with categories:', JSON.stringify(tripWithCategories.toJSON(), null, 2));

    // Test 5: List all trips
    console.log('\n5️⃣ Listing all trips...');
    const allTrips = await Trip.findAll({
      include: [{ model: Category, as: 'categories' }]
    });
    console.log('✅ All trips count:', allTrips.length);

    // Test 6: List all categories
    console.log('\n6️⃣ Listing all categories...');
    const allCategories = await Category.findAll();
    console.log('✅ All categories count:', allCategories.length);

    console.log('\n🎉 All tests passed! Database setup is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabaseOperations();
