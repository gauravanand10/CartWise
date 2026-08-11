# 💻 CH15 — Commands

> **Project:** CartWise  
> **Chapter:** Backend Architecture

This file contains the commands used to develop, verify, and run the CartWise backend skeleton.

---

# 🚀 Backend Setup Commands

## Generate the Spring Boot Project (One-Time)

This was already done using Spring Initializr or the `spring boot:create` command. If you were starting from scratch:

```bash
mvn -B archetype:generate \
  -DarchetypeGroupId=org.apache.maven.archetypes \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DgroupId=com.cartwise \
  -DartifactId=backend \
  -DinteractiveMode=false
```

Then add Spring Boot dependencies to `pom.xml`.

**For this project, the backend/ directory is already scaffolded — no need to run this.**

---

# 🛠️ Maven Commands

## Clean the Build Directory

```bash
cd backend
mvn clean
```

Removes the `target/` directory and any compiled classes.

---

## Compile Source Code

```bash
mvn compile
```

Compiles `src/main/java/` into `target/classes/`.

---

## Run Tests

```bash
mvn test
```

Runs all tests in `src/test/java/`.

---

## Package the Application

```bash
mvn package
```

Compiles, tests, and creates a JAR file in `target/cartwise-backend-1.0.0.jar`.

---

## Full Build Verification

```bash
mvn clean verify
```

Cleans, compiles, runs all tests, and verifies the entire build. Use this before committing.

### Expected Output

```text
[INFO] BUILD SUCCESS
[INFO] Total time: X.XXs
[INFO] Finished at: [timestamp]
```

---

# 🚀 Running the Backend

## Start the Development Server

```bash
cd backend
mvn spring-boot:run
```

Compiles and starts the backend on `localhost:8080`. Logs show the startup sequence, including profile configuration and port binding.

### Expected Log Output (summary)

```text
...
2025-08-10 14:32:18.123  INFO CartWiseApplication : Started CartWiseApplication in 2.345s
2025-08-10 14:32:18.456  INFO Tomcat : Tomcat started on port(s): 8080 (http)
...
```

Press `Ctrl+C` to stop the server.

---

## Start with a Specific Profile

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

Runs the backend with the `prod` profile, loading `application-prod.yml` instead of `application-dev.yml`.

---

## Build a JAR and Run It

```bash
mvn clean package
java -jar backend/target/cartwise-backend-1.0.0.jar
```

Creates a standalone JAR and runs it. This is closer to production deployment than `mvn spring-boot:run`.

---

# 🔍 Testing the Backend

## Test the Health Endpoint with curl

```bash
curl http://localhost:8080/api/health
```

### Expected Response

```json
{"status":"UP","timestamp":"2025-08-10T14:32:18.547Z","message":"CartWise backend is running"}
```

Status code: `200 OK`.

---

## Test a Nonexistent Endpoint (404 Verification)

```bash
curl http://localhost:8080/api/nonexistent
```

### Expected Response

```text
HTTP/1.1 404 Not Found
```

Status code should be `404`, not `500` — this verifies the exception handler is not corrupting status codes.

---

## Test CORS with a Real Preflight Request

From the frontend's browser console (with both servers running):

```js
fetch('http://localhost:8080/api/health', {
  method: 'GET',
  headers: { 'X-Custom-Header': 'test' }
})
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error('CORS error:', e))
```

### Expected Result

```text
{status: "UP", timestamp: "...", message: "CartWise backend is running"}
```

If CORS is misconfigured, you will see:

```text
CORS error: (browser blocks the request)
```

---

## Test CORS with a Rejected Origin

From the browser console, simulate a rejected origin by making a request with fetch options:

```js
// This is harder to test directly, but the backend logs will show if CORS rejected it
// Alternatively, open DevTools Network tab and look at the OPTIONS response headers
```

In the DevTools Network tab, look for an OPTIONS request to `/api/health`:
- If `Access-Control-Allow-Origin: http://localhost:5173` is in the response headers, CORS is working
- If that header is absent, CORS rejected the origin

---

# 📋 Verification Checklist

Run through this sequence to verify Chapter 15 is complete and correct:

## 1. Backend Boots

```bash
cd backend
mvn spring-boot:run
```

**Verify:**
- No `WARN` or `ERROR` in the logs (OK to see `INFO`)
- "Tomcat started on port(s): 8080" appears
- Takes roughly 2-3 seconds to start

## 2. Frontend Still Works

In a second terminal:

```bash
cd frontend
npm run dev
```

**Verify:**
- Frontend starts on port 5173 (or check the output for the actual port)
- Open `http://localhost:5173` in a browser
- Homepage loads
- Click "Wishlist" and confirm the page loads and functions
- No errors in the browser console

## 3. Health Endpoint Responds

```bash
curl http://localhost:8080/api/health
```

**Verify:**
- Response is valid JSON
- `"status":"UP"` is present
- Status code is 200

## 4. Frontend Can Call the Backend

Open the browser's DevTools console (on the frontend page at `localhost:5173`):

```js
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Verify:**
- No CORS error
- Data is printed to the console
- The data matches the curl response

## 5. CORS Rejects Invalid Origins

In the browser console, try accessing from a different origin (this is trickier — consult the backend logs or use curl with a custom Host header):

```bash
curl -H "Origin: http://evil.example.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8080/api/health
```

**Verify:**
- Response does NOT include `Access-Control-Allow-Origin: http://evil.example.com`
- CORS is enforced, not wide-open

## 6. Status Codes Are Correct

```bash
curl -w "\nHTTP Status: %{http_code}\n" http://localhost:8080/api/nonexistent
```

**Verify:**
- HTTP Status is 404, not 500
- The exception handler is not corrupting status codes

## 7. No Unexpected Warnings in Logs

While the backend is running, check the logs for unexpected warnings:

```text
✓ No WARN about "No mapping found"
✓ No WARN about "NoHandlerFoundException"
✓ No WARN about "Security default password"
✓ No WARN about "Deprecated configuration"
```

---

# 🌐 Running Both Servers Together

Once verified, you can run both servers at once (requires two terminal windows or tmux/screen):

**Terminal 1 — Backend:**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Both must be running for the frontend to reach the backend. If the frontend tries to call the backend and it's down, the fetch will fail (but the frontend still works locally).

---

# 🏗️ Build Tool Verification

## Check Maven Version

```bash
mvn --version
```

### Expected

```text
Apache Maven 3.8.1 (or later)
Java version: 21.x.x
```

---

## Check Java Version

```bash
java --version
```

### Expected

```text
openjdk 21.x.x
```

If a different version is installed, set `JAVA_HOME`:

```bash
# Linux/Mac
export JAVA_HOME=/path/to/jdk21

# Windows (PowerShell)
$env:JAVA_HOME = "C:\path\to\jdk21"
```

---

## Dependency Tree

```bash
mvn dependency:tree
```

Shows all dependencies and their versions. Useful for debugging version conflicts.

---

# 🧪 IDE Integration (Optional)

## IntelliJ IDEA

- Open the `backend/` folder as a project
- Mark `src/main/java` as Sources Root
- Mark `src/test/java` as Test Sources Root
- Run → Run 'CartWiseApplication' to start the backend from the IDE

## VS Code with Extension Pack for Java

- Install "Extension Pack for Java" (Microsoft)
- Open the `backend/` folder
- Run the application via the Run button or `Ctrl+F5`

---

# 🌿 Git Commands for This Chapter

## Check What Changed

```bash
git status
```

Should show only `backend/` as new.

---

## Stage All Changes

```bash
git add .
```

---

## Commit

```bash
git commit -m "feat: implement Chapter 15 backend architecture with Spring Boot skeleton"
```

---

## Push

```bash
git push origin main
```

---

## View Commit History

```bash
git log --oneline -5
```

Should show the Chapter 15 commit on top.

---

# 📄 Configuration Inspection

## View Active Configuration

The backend logs its active profile on startup:

```text
The following profiles are active: dev
```

---

## View Spring Boot Auto-Configuration

Add this to `application.yml` to see what Spring Boot auto-configured:

```yaml
debug: true
```

Restart the server and look for a "Positive matches" and "Negative matches" section in the logs. This is useful for debugging why a bean is or isn't being created.

---

# 🔧 Troubleshooting Commands

## Port Already in Use

If `mvn spring-boot:run` fails with "Address already in use":

```bash
# Find what's using port 8080
lsof -i :8080        # Linux/Mac
netstat -ano | findstr :8080  # Windows

# Kill the process (example for Linux/Mac)
kill -9 <PID>
```

Or run on a different port:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

---

## Maven Wrapper Not Found

If `mvnw` is missing, Maven was installed globally:

```bash
mvn clean verify
```

---

## Stale Maven Cache

If Maven is downloading old versions or dependencies are failing:

```bash
mvn clean install -U
```

The `-U` flag forces Maven to update all snapshots from the repository.

---

## Check If Backend Is Running

```bash
curl -i http://localhost:8080/api/health
```

If the backend is down, `curl` will time out. If it's up, you get the health response.

---

# 📌 Command Summary

```bash
# Development
cd backend
mvn clean verify            # Full build check
mvn spring-boot:run        # Start the server
curl http://localhost:8080/api/health  # Test the endpoint

# Git
git add .
git commit -m "feat: implement Chapter 15 backend architecture with Spring Boot skeleton"
git push origin main

# Both servers together
# Terminal 1:
cd backend && mvn spring-boot:run

# Terminal 2:
cd frontend && npm run dev
```

---

# 🎯 Next Steps

After Chapter 15:

- Chapter 16 adds the database: `@Entity` classes, `@Repository` interfaces, JPA configuration
- Chapter 17 adds real REST endpoints: Product endpoints, Wishlist endpoints, API docs
- Chapter 18 adds authentication: Spring Security, JWT, role-based access control
- Chapters 19+ add the complete backend and deployment

The skeleton is ready for all of it.
