import { writeFile } from "fs/promises";
import { join, parse } from "path";
import { readdirSync, readFileSync } from "fs";

interface ParsedRoute {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
}

/**
 * Parse route file and extract route definitions
 */
function parseRouteFile(filePath: string): ParsedRoute[] {
  const content = readFileSync(filePath, "utf-8");
  const parsedPath = parse(filePath);
  const fileName = parsedPath.name;

  const routes: ParsedRoute[] = [];

  // Find route patterns like:
  // authRoute.get("/path", ...
  // deliveriesRoute.post("/path", ...
  const routeRegex = /\w+\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi;

  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const [, method, path] = match;

    routes.push({
      method: method.toUpperCase(),
      path: `/${fileName}${path}`,
      summary: generateSummary(method, path),
      description: `${method} endpoint for ${fileName}`,
      tags: [fileName],
    });
  }

  return routes;
}

/**
 * Generate human-readable summary from route info
 */
function generateSummary(method: string, path: string): string {
  const pathParts = path.split("/").filter(Boolean);
  const resource = pathParts[pathParts.length - 1] || "resource";

  const actions: Record<string, string> = {
    GET: `Get ${resource}`,
    POST: `Create ${resource}`,
    PUT: `Update ${resource}`,
    PATCH: `Update ${resource}`,
    DELETE: `Delete ${resource}`,
  };

  return actions[method] || `${method} ${resource}`;
}

/**
 * Build OpenAPI spec object from parsed routes
 */
function buildOpenAPISpec(allRoutes: ParsedRoute[]): any {
  const paths: Record<string, any> = {};

  // Group routes by path
  const groupedRoutes = new Map<string, ParsedRoute[]>();

  allRoutes.forEach((route) => {
    if (!groupedRoutes.has(route.path)) {
      groupedRoutes.set(route.path, []);
    }
    groupedRoutes.get(route.path)!.push(route);
  });

  // Build paths object
  groupedRoutes.forEach((routes, path) => {
    paths[path] = {};

    routes.forEach((route) => {
      const method = route.method.toLowerCase();
      const isPublic = path === "/health" || path.startsWith("/auth/") || path.startsWith("/profile/email");

      paths[path][method] = {
        tags: route.tags,
        summary: route.summary,
        description: route.description,
        security: isPublic ? [] : [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad Request",
          },
          "401": {
            description: "Unauthorized",
          },
          "500": {
            description: "Internal Server Error",
          },
        },
      };
    });
  });

  return {
    openapi: "3.0.0",
    info: {
      title: "Pengamanan API",
      version: "1.0.0",
      description: "API for Pokayoke scanning system - Quality control for automotive parts",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://pokayoke-api.hadirapp.com",
        description: "Production server",
      },
    ],
    tags: [
      { name: "auth", description: "Authentication endpoints" },
      { name: "users", description: "User management" },
      { name: "customers", description: "Customer management" },
      { name: "deliveries", description: "Delivery and scanning operations" },
      { name: "parts", description: "Parts management" },
      { name: "menus", description: "Menu management" },
      { name: "scan-logs", description: "Scan logging" },
      { name: "configs", description: "Configuration management" },
      { name: "profile", description: "User profile management" },
    ],
    paths,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };
}

/**
 * Main generator function
 */
async function generateOpenAPISpec() {
  console.log("🔍 Scanning route files...");

  const routesDir = join(process.cwd(), "src/routes");
  const allRoutes: ParsedRoute[] = [];

  // Read all route files
  const files = readdirSync(routesDir).filter((f) =>
    f.endsWith(".ts") && !f.includes("example") && !f.includes("openapi")
  );

  files.forEach((file) => {
    const filePath = join(routesDir, file);
    const routes = parseRouteFile(filePath);
    allRoutes.push(...routes);

    console.log(`  ✅ Parsed ${file}: ${routes.length} routes`);
  });

  console.log(`\n📊 Total routes found: ${allRoutes.length}`);

  // Generate OpenAPI spec
  console.log("📝 Generating OpenAPI spec...");
  const spec = buildOpenAPISpec(allRoutes);

  // Write to file
  const outputPath = join(process.cwd(), "openapi.json");
  await writeFile(outputPath, JSON.stringify(spec, null, 2));

  console.log(`\n✅ OpenAPI spec generated at: ${outputPath}`);
  console.log(`\n📋 Routes by tag:`);

  // Print summary
  const tagCounts = new Map<string, number>();
  allRoutes.forEach((route) => {
    route.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  tagCounts.forEach((count, tag) => {
    console.log(`  - ${tag}: ${count} routes`);
  });
}

// Run the generator
generateOpenAPISpec().catch(console.error);
