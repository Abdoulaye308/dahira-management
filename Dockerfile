FROM eclipse-temurin:24-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 10000

CMD ["java", "-Xms128m", "-Xmx384m", "-XX:MaxMetaspaceSize=128m", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]