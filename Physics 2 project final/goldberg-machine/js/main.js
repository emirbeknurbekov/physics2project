$(document).ready(function () {
	// ! FUNCTIONS TO CREATE SHAPES
	const shapes = {
		circle(radius, config) {
			return Bodies.circle(100, 20, radius, config);
		},
		rectangle(width, height, config) {
			return Bodies.rectangle(100, 20, width, height, config);
		},

		polygon(sides = 5, length = 30, config) {
			return Bodies.polygon(100, 20, sides, length, config);
		},
		trapezoid(width, height, slope, config) {
			return Bodies.trapezoid(100, 20, width, height, slope, config);
		},
	};

	// module aliases
	var Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Bodies = Matter.Bodies,
		Body = Matter.Body,
		Events = Matter.Events,
		Composites = Matter.Composites,
		MouseConstraint = Matter.MouseConstraint,
		Mouse = Matter.Mouse;

	var engine = Engine.create();

	var render = Render.create({
		element: document.body,
		engine: engine,
		options: {
			width: $(window).width(),
			height: $(window).height() - 60,
			background: "#ccc",
			wireframes: false,
			showAngleIndicator: true,
			showCollisions: true,
			showSleeping: true,
			showVelocity: true,
			showIds: true,
		},
	});

	var redColor = "#C44D58",
		greenColor = "#C7F464";

	// create two boxes and a ground
	let boxA = Bodies.circle(10, 200, 20, {
		isSleeping: true,
		mass: 4,
		restitution: 0.3,
		render: { strokeStyle: redColor },
	});
	let plane = Bodies.rectangle(300, 280, 700, 20, {
		isSleeping: true,
		angle: Math.PI * 0.06,
	});
	let ground = Bodies.rectangle(
		$(window).width() / 2,
		$(window).height() - 60,
		$(window).width(),
		60,
		{ isStatic: true }
	);
	let rec = Bodies.rectangle(600, 300, 40, 12, {
		isSleeping: true,
		angle: Math.PI * 0.56,
	});
	// add all of the bodies to the world
	World.add(engine.world, [boxA, ground, plane, rec]);
	// World.add(engine.world, Composites.car(150, 100, 150, 30, 30));
	Engine.run(engine);
	Render.run(render);

	Render.lookAt(render, {
		min: { x: 0, y: 0 },
		max: { x: $(window).width(), y: $(window).height() - 60 },
	});

	var mouse = Mouse.create(render.canvas),
		mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.5,
				render: {
					visible: false,
				},
			},
		});

	engine.world.gravity.y = 2.5;
	World.add(engine.world, mouseConstraint);
	render.mouse = mouse;
	var editBody = null;

	Matter.Events.on(mouseConstraint, "startdrag", function (event) {
		event.body.isStatic = false;
		event.body.isSensor = true;
	});

	Matter.Events.on(mouseConstraint, "enddrag", function (event) {
		event.body.isStatic = true;
		event.body.isSensor = false;
		Body.set(event.body, { velocity: { x: 0, y: 0 } });
		editBody = event.body;
		console.log(editBody);
	});

	$("#run-btn").click(function () {
		// $('#run-btn').text("STOP");
		boxA.isSleeping = false;
		boxA.isStatic = false;
		rec.isStatic = false;
		rec.isSleeping = true;
	});

	$("#reload-btn").click(function () {
		location.reload();
	});

	$("#new").on("click", function () {
		World.add(engine.world, shapes.trapezoid());
	});

	$("#edit-modal").on("shown.bs.modal", function () {
		if (editBody !== null) {
			$("#edit-name").val(editBody.label);
			$("#edit-radius").val(editBody.circleRadius);
			$("#edit-angle").val((editBody.angle * 180) / Math.PI);
			$("#edit-mass").val(editBody.mass);
			$("#edit-friction").val(editBody.friction);
			$("#edit-restitution").val(editBody.restitution);
		}
	});

	$("#edit-save").on("click", function () {
		editBody.label = $("#edit-name").val();
		editBody.circleRadius = +$("#edit-radius").val();
		Body.rotate(
			editBody,
			(-((editBody.angle * 180) / Math.PI - $("#edit-angle").val()) * Math.PI) /
				180
		);
		editBody.mass = +$("#edit-mass").val();
		editBody.friction = +$("#edit-friction").val();
		editBody.restitution = +$("#edit-restitution").val();
	});

	// ! LISTENER TO CREATE CIRCLE
	$("#circle-save").on("click", () => {
		const radius = +$("#circle-radius").val();
		const config = {
			mass: +$("#circle-mass").val(),
			restitution: +$("#circle-friction").val(),
			friction: +$("#circle-restitution").val(),
		};
		World.add(engine.world, shapes.circle(radius, config));
	});

	// ! LISTENER TO CREATE RECTANGLE
	$("#rectangle-save").on("click", () => {
		const width = +$("#rectangle-width").val();
		const height = +$("#rectangle-height").val();
		const config = {
			mass: +$("#rectangle-mass").val(),
			restitution: +$("#rectangle-friction").val(),
			friction: +$("#rectangle-restitution").val(),
		};
		World.add(engine.world, shapes.rectangle(width, height, config));
	});

	// ! LISTENER TO CREATE POLYGON
	$("#polygon-save").on("click", () => {
		const sides = +$("#polygon-sides").val();
		const length = +$("#polygon-length").val();
		const config = {
			mass: +$("#polygon-mass").val(),
			restitution: +$("#polygon-friction").val(),
			friction: +$("#polygon-restitution").val(),
		};
		World.add(engine.world, shapes.polygon(sides, length, config));
	});

	// ! LISTENER TO CREATE TRAPEZOID
	$("#trapezoid-save").on("click", () => {
		const width = +$("#trapezoid-width").val();
		const height = +$("#trapezoid-height").val();
		const slope = +$("#trapezoid-slope").val();
		const config = {
			mass: +$("#trapezoid-mass").val(),
			restitution: +$("#trapezoid-friction").val(),
			friction: +$("#trapezoid-restitution").val(),
		};
		World.add(engine.world, shapes.trapezoid(width, height, slope, config));
	});

	$("#random").on("click", () => {
		const radius = 30;
		const mass = Math.floor(Math.random() * 91) + 10;
		const config = {
			mass,
			restitution: 0.5,
			friction: 0,
		};

		const yPosition = Math.floor(Math.random() * 501) + 20;
		const height = (870 - yPosition) / 100;

		const time = Math.sqrt((height * 2) / 9.8);
		const energy = height * 9.8 * mass;

		$(".time").text(`${time.toFixed(3)}с`);
		$(".energy").text(`${energy.toFixed(3)}Дж`);

		const circle = Bodies.circle(
			$(window).width() - 400,
			yPosition,
			radius,
			config
		);
		World.add(engine.world, circle);
	});
});
