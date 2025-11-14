package nl.saxion.disaster.notification_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.notification_service.service.contract.DeploymentNotificationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notifications/deployment")
@RequiredArgsConstructor
@Tag(
        name = "Deployment Notifications",
        description = "Provides real-time Server-Sent Events (SSE) notifications for deployment requests."
)
public class DeploymentNotificationController {

    private final DeploymentNotificationService notificationService;

    /**
     * SSE endpoint for department officers to receive
     * deployment request notifications in real time.
     */
    @Operation(
            summary = "Stream real-time deployment notifications",
            description = """
                    Opens a **Server-Sent Events (SSE)** stream that keeps the HTTP
                    connection open and continuously pushes events to the client.
                    
                    Clients (e.g., department officers) connect using the endpoint:
                    
                    `/notifications/deployment/stream/{departmentId}`
                    
                    The stream automatically sends new deployment request events
                    targeted to the given department.
                    """)
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "SSE stream opened successfully",
                    content = @Content(mediaType = MediaType.TEXT_EVENT_STREAM_VALUE)
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Department not found",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    @GetMapping(value = "/stream/{departmentId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDeploymentNotifications(
            @Parameter(
                    description = "ID of the target department that should receive notifications",
                    required = true,
                    example = "12"
            )
            @PathVariable Long departmentId
    ) {
        return notificationService.connectStream(departmentId);
    }
}
